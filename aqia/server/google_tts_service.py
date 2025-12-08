from google.cloud import texttospeech
import os

class GoogleTTSService:
    def __init__(self, credentials_path: str = "google-credentials.json"):
        # Handle potential double extension if user made a mistake, or fall back to default
        if not os.path.exists(credentials_path):
             # Try double extension just in case
             if os.path.exists(credentials_path + ".json"):
                 credentials_path = credentials_path + ".json"
        
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path
        self.client = texttospeech.TextToSpeechClient()

    def generate_audio(self, text: str, output_path: str, voice_name: str = "en-US-Neural2-F"):
        """
        Generates audio from text using Google Cloud TTS.
        
        Args:
            text (str): The text to synthesize.
            output_path (str): Path to save the wav file.
            voice_name (str): The Google TTS voice name (e.g., 'en-US-Neural2-F').
        """
        
        synthesis_input = texttospeech.SynthesisInput(text=text)

        # Parse language code from voice name (e.g., "en-US")
        language_code = "-".join(voice_name.split("-")[:2])

        voice = texttospeech.VoiceSelectionParams(
            language_code=language_code,
            name=voice_name
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        response = self.client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )

        with open(output_path, "wb") as out:
            out.write(response.audio_content)
