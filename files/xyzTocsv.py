import pandas as pd
import sys
from pathlib import Path


def xyz_to_csv(input_file, output_file=None):
    input_path = Path(input_file)

    if output_file is None:
        output_file = input_path.with_suffix(".csv")

    # Read whitespace-separated XYZ file
    df = pd.read_csv(input_file, sep=r"\s+", header=None, names=["x", "y", "z"])

    # Convert to numeric and remove invalid rows
    df = df.apply(pd.to_numeric, errors="coerce")
    df = df.dropna()

    # Save CSV
    df.to_csv(output_file, index=False)

    print(f"Converted: {input_file}")
    print(f"Saved to:  {output_file}")
    print(f"Points:    {len(df)}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python xyz_to_csv.py input.xyz")
        print("  python xyz_to_csv.py input.xyz output.csv")
        sys.exit(1)

    input_file = sys.argv[1]

    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    xyz_to_csv(input_file, output_file)
