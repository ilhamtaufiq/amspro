import sys
import json
import pandas as pd
from pandasai import SmartDataframe
from pandasai.llm import OpenAI

def main():
    # Baca input dari PHP (JSON string, prompt, dan API key)
    input_data = sys.argv[1]
    user_prompt = sys.argv[2]
    api_key = sys.argv[3]

    # Parse JSON input
    try:
        data = json.loads(input_data)
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
        return

    # Ubah data ke DataFrame
    df = pd.DataFrame(data)
    if df.empty:
        print(json.dumps({"error": "Empty DataFrame"}))
        return

    # Inisialisasi PandasAI dengan OpenRouter via OpenAI-compatible API
    try:
        llm = OpenAI(
            api_token=api_key,
            base_url="https://openrouter.ai/api/v1",
            model="deepseek/deepseek-r1-distill-llama-70b:free"
        )
        smart_df = SmartDataframe(df, config={"llm": llm})
    except Exception as e:
        print(json.dumps({"error": f"Failed to initialize LLM: {str(e)}"}))
        return

    # Proses prompt pengguna
    try:
        result = smart_df.chat(user_prompt)
        # Konversi hasil ke JSON
        if isinstance(result, pd.DataFrame):
            output = result.to_dict(orient="records")
        elif isinstance(result, (list, dict)):
            output = result
        else:
            output = {"result": str(result)}
        print(json.dumps(output))
    except Exception as e:
        print(json.dumps({"error": f"PandasAI processing failed: {str(e)}"}))

if __name__ == "__main__":
    main()
