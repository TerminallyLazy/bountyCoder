from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from app.metrics import TOKENS_GENERATED
import os

class LLMModel:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
    
    def load_model(self, model_name_or_path="microsoft/phi-2"):
        """
        Load the model and tokenizer.
        
        Args:
            model_name_or_path (str): Model ID on Hugging Face or local path
        """
        print(f"Loading model {model_name_or_path} on {self.device}")
        
        # If model_name_or_path is a directory, check if it exists
        if os.path.isdir(model_name_or_path):
            if not os.path.exists(model_name_or_path):
                raise ValueError(f"Model directory {model_name_or_path} does not exist")
        
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_name_or_path, 
            trust_remote_code=True
        )
        
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name_or_path,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            device_map="auto" if self.device == "cuda" else None,
            trust_remote_code=True
        )
        
        print(f"Model loaded successfully")
        return self
    
    def generate(self, prompt, max_length=100, temperature=0.7, top_p=0.9):
        """
        Generate text based on the prompt.
        
        Args:
            prompt (str): The input prompt
            max_length (int): Maximum length of generated tokens
            temperature (float): Sampling temperature
            top_p (float): Nucleus sampling parameter
            
        Returns:
            str: Generated text
        """
        if self.model is None or self.tokenizer is None:
            raise ValueError("Model and tokenizer must be loaded before generation")
        
        # Encode the prompt
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
        input_ids_length = len(inputs.input_ids[0])
        
        # Generate
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_length=input_ids_length + max_length,
                temperature=temperature,
                top_p=top_p,
                do_sample=True
            )
        
        # Decode the generated text
        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Update metrics - count tokens generated
        tokens_generated = len(outputs[0]) - input_ids_length
        TOKENS_GENERATED.inc(tokens_generated)
        
        return generated_text