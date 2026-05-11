from google.cloud import texttospeech
import os


# Voice quality tiers (all free within Google Cloud TTS quota):
# Chirp 3 HD  — most natural, conversational, human-like (newest)
# Journey     — very natural, warm tone
# Neural2     — good quality, slightly synthetic
# Standard    — robotic, avoid

# Preferred voice cascade — first available will be used
VOICE_CASCADE = [
    "en-US-Chirp3-HD-Aoede",    # Chirp 3 HD — warm female, most natural
    "en-US-Journey-F",           # Journey — natural female
    "en-US-Neural2-F",           # Neural2 — fallback
]

# SSML prosody wrapper — adds natural pacing and slight expressiveness
# Pitch slightly lower (-1st) sounds less robotic
# Speaking rate 0.95 feels more deliberate and human
SSML_TEMPLATE = """<speak>
  <prosody rate="0.95" pitch="-1st">
    {text}
  </prosody>
</speak>"""


class GoogleTTSService:
    def __init__(self, credentials_path: str = "google-credentials.json"):
        if not os.path.exists(credentials_path):
            if os.path.exists(credentials_path + ".json"):
                credentials_path = credentials_path + ".json"
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path
        self.client = texttospeech.TextToSpeechClient()
        self._working_voice = None  # cached after first successful call

    def _try_voice(self, text: str, voice_name: str, output_path: str) -> bool:
        """Attempt synthesis with a specific voice. Returns True on success."""
        try:
            language_code = "-".join(voice_name.split("-")[:2])

            # Use SSML for natural prosody
            ssml_text = SSML_TEMPLATE.format(text=text)
            synthesis_input = texttospeech.SynthesisInput(ssml=ssml_text)

            voice = texttospeech.VoiceSelectionParams(
                language_code=language_code,
                name=voice_name,
            )
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                effects_profile_id=["headphone-class-device"],  # optimised EQ
                speaking_rate=0.95,
                pitch=-1.0,
            )
            response = self.client.synthesize_speech(
                input=synthesis_input, voice=voice, audio_config=audio_config
            )
            with open(output_path, "wb") as f:
                f.write(response.audio_content)
            return True
        except Exception as e:
            print(f"⚠️  Voice {voice_name} failed: {e}")
            return False

    def generate_audio(
        self,
        text: str,
        output_path: str,
        voice_name: str = None,
    ) -> str:
        """
        Generate speech audio with the most natural available voice.

        Voice selection order:
          1. Explicit voice_name if provided
          2. Previously cached working voice
          3. VOICE_CASCADE — tries Chirp 3 HD → Journey → Neural2

        Returns the voice name that was used.
        """
        candidates = []
        if voice_name:
            candidates.append(voice_name)
        if self._working_voice and self._working_voice not in candidates:
            candidates.append(self._working_voice)
        for v in VOICE_CASCADE:
            if v not in candidates:
                candidates.append(v)

        for v in candidates:
            if self._try_voice(text, v, output_path):
                self._working_voice = v  # cache for next call
                return v

        raise RuntimeError("All Google TTS voices failed")
