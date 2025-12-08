try:
    from transformers import GPT2PreTrainedModel
    print("SUCCESS: Imported GPT2PreTrainedModel directly")
except ImportError as e:
    print(f"FAILURE: Could not import GPT2PreTrainedModel directly: {e}")

try:
    import TTS
    print("SUCCESS: Imported TTS package")
    from TTS.api import TTS
    print("SUCCESS: Imported TTS class")
except ImportError as e:
    print(f"FAILURE: Could not import TTS: {e}")
except Exception as e:
    print(f"FAILURE: TTS Import Error: {e}")

import transformers
print(f"Transformers version: {transformers.__version__}")
