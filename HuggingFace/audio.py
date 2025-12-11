import soundfile as sf
from transformers import pipeline

# load and convert to mono if needed
audio, sr = sf.read("audio.wav")
if audio.ndim > 1:
    audio = audio.mean(axis=1)

# resample if not 16000 (Whisper works best at 16000)
try:
    import librosa
    if sr != 16000:
        audio = librosa.resample(audio, orig_sr=sr, target_sr=16000)
        sr = 16000
except Exception:
    # if librosa not installed, it's OK — pipeline may still work, but install librosa for best results:
    # pip install librosa soundfile
    pass

# Use English-only model
asr = pipeline("automatic-speech-recognition", model="openai/whisper-tiny.en", device=-1)  # device=-1 forces CPU
result = asr({"array": audio, "sampling_rate": sr})
print(result["text"])
