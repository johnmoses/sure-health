import os
import numpy as np
import json
import random
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, pipeline
from config.dbx import connect

# Database with connection pooling
conn = connect()
cur = conn.cursor()

# Load language models
base_model_path = "bert-model"

base_model = AutoModelForSeq2SeqLM.from_pretrained(base_model_path)
base_tokenizer = AutoTokenizer.from_pretrained(base_model_path)
