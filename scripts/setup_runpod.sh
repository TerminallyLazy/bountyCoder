#!/bin/bash
# Setup script for RunPod environment

# Exit on error
set -e

echo "Setting up LLM service environment..."

# Check package manager and install dependencies
if command -v dnf &> /dev/null; then
    # Fedora/RHEL based system
    echo "Using dnf package manager"
    dnf update -y
    dnf install -y git wget curl
elif command -v apt-get &> /dev/null; then
    # Debian/Ubuntu based system
    echo "Using apt package manager"
    apt-get update && apt-get upgrade -y
    apt-get install -y git wget curl
else
    echo "Unsupported package manager. Skipping system package installation."
fi

# Setup conda environment properly
CONDA_ENV_NAME="bountyCoder2"
REQUIREMENTS_PATH="/home/lazy/Projects/bountyCoder/requirements.txt"

echo "Creating conda environment: $CONDA_ENV_NAME"
conda create -y -n $CONDA_ENV_NAME python=3.11

# Use conda run instead of conda activate
echo "Installing dependencies via conda run"
conda run -n $CONDA_ENV_NAME pip install -r $REQUIREMENTS_PATH

# Download model using conda environment
echo "Downloading model (Phi-2)..."
conda run -n $CONDA_ENV_NAME python -c "
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model_name = 'microsoft/phi-2'
print(f'Downloading {model_name}...')

# Download and save tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
tokenizer.save_pretrained('./phi-2')
print('Tokenizer downloaded and saved')

# Download and save model
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map='auto' if torch.cuda.is_available() else None,
    trust_remote_code=True
)
model.save_pretrained('./phi-2')
print('Model downloaded and saved')
"

# Create prometheus.yml file
echo "Creating Prometheus configuration..."
cat > prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'llm-service'
    static_configs:
      - targets: ['localhost:8000']
EOF

echo "Setup complete!"
echo "To activate the environment, run:"
echo "  conda activate $CONDA_ENV_NAME"
echo ""
echo "To start the LLM service, run:"
echo "  python -m app.main"
echo ""
echo "To start Prometheus (if not already running), run:"
echo "  prometheus --config.file=prometheus.yml"