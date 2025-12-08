import transformers
import transformers.pytorch_utils as pu

print(f"Transformers version: {transformers.__version__}")
print("Attributes in pytorch_utils:")
print(dir(pu))
if hasattr(pu, 'isin_mps_friendly'):
    print("isin_mps_friendly FOUND")
else:
    print("isin_mps_friendly NOT FOUND")
