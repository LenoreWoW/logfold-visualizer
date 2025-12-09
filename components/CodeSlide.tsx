import React, { useMemo } from 'react';

const PROJECT_CODE = `# 1. Install dependencies
!pip install -q "protobuf<4" transformers accelerate

# 2. Imports
import os
import random
import numpy as np
import pandas as pd

from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import f1_score

import torch
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW  # <-- use PyTorch AdamW

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    get_linear_schedule_with_warmup  # <-- scheduler still from transformers
)

import copy

# 3. Reproducibility
def set_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)

set_seed(42)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# 4. Load data
DATA_DIR = "/kaggle/input/nlp-getting-started"

train_df = pd.read_csv(os.path.join(DATA_DIR, "train.csv"))
test_df  = pd.read_csv(os.path.join(DATA_DIR, "test.csv"))

print("Train shape:", train_df.shape)
print("Test shape:",  test_df.shape)

# 5. Basic text preprocessing: combine keyword + text
def build_full_text(df):
    kw = df["keyword"].fillna("").astype(str)
    txt = df["text"].fillna("").astype(str)
    full = (kw + " " + txt).str.strip()
    return full

train_df = train_df.copy()
test_df  = test_df.copy()

train_df["full_text"] = build_full_text(train_df)
test_df["full_text"]  = build_full_text(test_df)

train_df = train_df.reset_index(drop=True)
test_df  = test_df.reset_index(drop=True)

print(train_df[["full_text", "target"]].head())

# 6. Model / tokenizer config
MODEL_NAME = "roberta-base"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

MAX_LEN = 128
BATCH_SIZE = 16
EPOCHS = 3
LR = 2e-5
N_FOLDS = 5

# 7. Dataset class
class TweetDataset(Dataset):
    def __init__(self, texts, labels=None, tokenizer=None, max_len=128):
        self.texts = list(texts)
        self.labels = list(labels) if labels is not None else None
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = self.texts[idx]
        if not isinstance(text, str):
            text = ""

        encoding = self.tokenizer(
            text,
            truncation=True,
            padding="max_length",
            max_length=self.max_len,
            return_tensors="pt"
        )

        item = {
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
        }

        if self.labels is not None:
            item["labels"] = torch.tensor(self.labels[idx], dtype=torch.long)

        return item

# 8. Helper functions: train / evaluate / predict
def train_one_epoch(model, dataloader, optimizer, scheduler, device, epoch_idx, fold_idx):
    model.train()
    total_loss = 0.0

    for step, batch in enumerate(dataloader):
        input_ids = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        labels = batch["labels"].to(device)

        optimizer.zero_grad()

        outputs = model(
            input_ids=input_ids,
            attention_mask=attention_mask,
            labels=labels
        )

        loss = outputs.loss
        total_loss += loss.item()

        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        scheduler.step()

        if (step + 1) % 100 == 0:
            print(
                f"  Fold {fold_idx+1} | Epoch {epoch_idx+1} | "
                f"Step {step+1}/{len(dataloader)} | Loss: {loss.item():.4f}"
            )

    avg_loss = total_loss / len(dataloader)
    return avg_loss


def eval_model(model, dataloader, device):
    model.eval()
    total_loss = 0.0
    all_probs = []
    all_labels = []

    with torch.no_grad():
        for batch in dataloader:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                labels=labels
            )

            loss = outputs.loss
            logits = outputs.logits

            total_loss += loss.item()

            probs = torch.softmax(logits, dim=1)[:, 1].cpu().numpy()
            all_probs.extend(probs)
            all_labels.extend(labels.cpu().numpy())

    avg_loss = total_loss / len(dataloader)
    return avg_loss, np.array(all_probs), np.array(all_labels)


def predict_test_probs(model, dataloader, device):
    model.eval()
    all_probs = []

    with torch.no_grad():
        for batch in dataloader:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)

            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask
            )

            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)[:, 1].cpu().numpy()
            all_probs.extend(probs)

    return np.array(all_probs)

# Prepare test loader
test_dataset = TweetDataset(
    texts=test_df["full_text"],
    labels=None,
    tokenizer=tokenizer,
    max_len=MAX_LEN
)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)

print("Test batches:", len(test_loader))

# 9. Cross-validation training & ensembling
y = train_df["target"].values
X = train_df["full_text"].values

skf = StratifiedKFold(n_splits=N_FOLDS, shuffle=True, random_state=42)

oof_probs = np.zeros(len(train_df))
test_fold_probs = []

for fold, (train_idx, val_idx) in enumerate(skf.split(X, y)):
    print(f"\\n========== Fold {fold+1} / {N_FOLDS} ==========")

    X_train, X_val = X[train_idx], X[val_idx]
    y_train, y_val = y[train_idx], y[val_idx]

    train_dataset = TweetDataset(
        texts=X_train,
        labels=y_train,
        tokenizer=tokenizer,
        max_len=MAX_LEN
    )
    val_dataset = TweetDataset(
        texts=X_val,
        labels=y_val,
        tokenizer=tokenizer,
        max_len=MAX_LEN
    )

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader   = DataLoader(val_dataset,   batch_size=BATCH_SIZE, shuffle=False)

    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=2
    )
    model.to(device)

    optimizer = AdamW(model.parameters(), lr=LR)  # <-- PyTorch AdamW
    total_steps = len(train_loader) * EPOCHS
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=int(0.1 * total_steps),
        num_training_steps=total_steps
    )

    best_fold_f1 = 0.0
    best_state = None

    for epoch in range(EPOCHS):
        print(f"\\nFold {fold+1} — Epoch {epoch+1}/{EPOCHS}")
        train_loss = train_one_epoch(
            model, train_loader, optimizer, scheduler, device,
            epoch_idx=epoch, fold_idx=fold
        )
        val_loss, val_probs, val_labels = eval_model(model, val_loader, device)
        val_preds = (val_probs >= 0.5).astype(int)
        val_f1 = f1_score(val_labels, val_preds)

        print(f"  Train loss: {train_loss:.4f}")
        print(f"  Val loss:   {val_loss:.4f}")
        print(f"  Val F1 @0.5: {val_f1:.4f}")

        if val_f1 > best_fold_f1:
            best_fold_f1 = val_f1
            best_state = copy.deepcopy(model.state_dict())
            print(f"  🔥 New best F1 for fold {fold+1}: {best_fold_f1:.4f}")

    model.load_state_dict(best_state)
    model.to(device)

    _, val_probs, val_labels = eval_model(model, val_loader, device)
    oof_probs[val_idx] = val_probs

    fold_test_probs = predict_test_probs(model, test_loader, device)
    test_fold_probs.append(fold_test_probs)

    print(f"Fold {fold+1} done. Best F1 (val): {best_fold_f1:.4f}")

# 10. OOF F1 and threshold tuning
print("\\n========== OOF Performance & Threshold Tuning ==========")
best_th = 0.5
best_f1 = 0.0

for th in np.arange(0.3, 0.71, 0.01):
    oof_pred_labels = (oof_probs >= th).astype(int)
    f1 = f1_score(y, oof_pred_labels)
    if f1 > best_f1:
        best_f1 = f1
        best_th = th

print(f"Best OOF F1: {best_f1:.4f} at threshold {best_th:.2f}")

# 11. Ensemble test predictions across folds
test_fold_probs = np.stack(test_fold_probs, axis=0)
mean_test_probs = test_fold_probs.mean(axis=0)

test_pred_labels = (mean_test_probs >= best_th).astype(int)

# 12. Create submission
submission = pd.DataFrame({
    "id": test_df["id"],
    "target": test_pred_labels
})

submission_path = "submission.csv"
submission.to_csv(submission_path, index=False)

print("\\nSaved submission to:", submission_path)
print(submission.head())`;

export const CodeSlide: React.FC = () => {
  const renderedCode = useMemo(() => {
    return PROJECT_CODE.split('\n').map((line, i) => {
      // Very basic semantic coloring based on tokens
      let content: React.ReactNode = line;
      
      const isComment = line.trim().startsWith('#');
      const isImport = line.trim().startsWith('import') || line.trim().startsWith('from');
      const isDef = line.trim().startsWith('def ') || line.trim().startsWith('class ');
      
      if (isComment) {
        content = <span className="text-emerald-600 italic">{line}</span>;
      } else if (isImport) {
        // Highlight import keywords
        const parts = line.split(' ');
        content = parts.map((part, idx) => {
          if (['import', 'from', 'as'].includes(part)) {
             return <span key={idx} className="text-purple-400">{part} </span>;
          }
          return <span key={idx} className="text-slate-300">{part} </span>;
        });
      } else if (isDef) {
         // Highlight function definitions
         content = <span className="text-blue-400 font-bold">{line}</span>;
      } else {
         // Highlight common keywords in normal lines
         const tokens = line.split(/(\s+|[(){},.])/g);
         content = tokens.map((token, idx) => {
             if (['if', 'else', 'for', 'in', 'return', 'print', 'with', 'def', 'class'].includes(token.trim())) {
                 return <span key={idx} className="text-purple-400">{token}</span>
             }
             if (['True', 'False', 'None'].includes(token.trim())) {
                 return <span key={idx} className="text-orange-400">{token}</span>
             }
             if (token.match(/^\d+$/)) {
                 return <span key={idx} className="text-cyan-300">{token}</span>
             }
             // String literals (very basic approximation)
             if (token.startsWith('"') || token.startsWith("'")) {
                 return <span key={idx} className="text-yellow-300">{token}</span>
             }
             return <span key={idx}>{token}</span>;
         });
      }

      return (
        <div key={i} className="hover:bg-slate-800/50">
          <span className="inline-block w-8 mr-4 text-right text-slate-600 select-none text-xs">{i + 1}</span>
          {content}
        </div>
      );
    });
  }, []);

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 select-none">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors"></div>
             <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors"></div>
           </div>
           <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-md border border-slate-800">
             <span className="text-blue-400 text-xs font-bold">PY</span>
             <span className="text-sm text-slate-300 font-mono">train_model.py</span>
           </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
           <span>utf-8</span>
           <span>Python 3.10</span>
           <span>Ln {PROJECT_CODE.split('\n').length}</span>
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 overflow-auto p-4 bg-[#0d1117] font-mono text-sm leading-6 text-slate-300">
        {renderedCode}
      </div>
    </div>
  );
};
