import { View, Text, Button, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { fft } from 'fft-js';
import { useState } from 'react';
import { Audio } from 'expo-av';  // For microphone access
import * as FileSystem from 'expo-file-system';
//import * as Permissions from 'expo-permissions';
import { init, AudioRecorderPlayer, AudioEncoderAndroidType, AudioSourceAndroidType } from 'react-native-audio-recorder-player';


export default function Home() {
  const [thickness, setThickness] = useState('0.70'); // Default string thickness
  const [frequency, setFrequency] = useState(440);   // To store recorded frequency
  const [recording, setRecording] = useState(null);   // Audio recording object
  const options = {
    isMeteringEnabled: true,
    android: {
      extension: '.3gp',
      outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_THREE_GPP,
      audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_NB,
    },
    ios: {
      extension: '.caf',
      audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
  };
  // Request microphone permission
  // const requestMicrophonePermission = async () => {
  //   const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
  //   return status === 'granted';
  // };

  const getPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      alert("Permission to access microphone is required!");
      return false;
    }
    return true;
  };
  
  // Start recording sound using the device's microphone
  const startRecording = async () => {
    try {
      const permission = await getPermission();
      if (!permission) return;
  
      const { recording } = await Audio.Recording.createAsync(options);

      setRecording(recording);
      await recording.startAsync();
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };
  // async function getAudioBuffer(uri) {
  //   try {
      
  //     const fileContent = await FileSystem.readAsStringAsync(uri, {
  //       encoding: FileSystem.EncodingType.Base64,
  //     });

  //     // Convert base64 string to an array of bytes
  //     const byteCharacters = atob(fileContent);
  //     const byteNumbers = new Array(byteCharacters.length);
  //     for (let i = 0; i < byteCharacters.length; i++) {
  //       byteNumbers[i] = byteCharacters.charCodeAt(i);
  //     }
  //     const audioBuffer = new Float32Array(byteNumbers);
  //     console.log("here");
  //     return audioBuffer;
  //   } catch (err) {
  //     console.error('Error reading audio file:', err);
  //     return null;
  //   }
  // }
  // Stop recording and extract frequency data (mock)
  async function stopRecording() {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();  // We could use this URI to process the frequency on the server-side
    console.log('Recording stopped and stored at', uri);
    const response = await fetch(uri);
    const audioData = await response.arrayBuffer();
    if (!audioData) {
      throw new Error("Failed to retrieve audio data");
    
    }
    console.log(audioData);
    console.log("About to initialize FFT");
    const signal = new Float32Array(audioData);
    const phasors = fft(signal);
    console.log("FFT initialized");
    // Calculate magnitudes from the FFT result
    const magnitudes = phasors.map(([real, imag]) => Math.sqrt(real ** 2 + imag ** 2));

    // Find the index with the maximum magnitude (dominant frequency)
    const maxIndex = magnitudes.reduce((maxIdx, val, idx, arr) => (val > arr[maxIdx] ? idx : maxIdx), 0);
    const sampleRate = 44100; // Assuming a sample rate of 44100 Hz
    const dominantFrequency = (maxIndex * sampleRate) / signal.length;
    console.log(dominantFrequency);
    // Mock frequency analysis
    //setFrequency(dominantFrequency);
  }

  // Function to send data to the server
  const sendData = () => {
    const data = {
      thickness: thickness,
      frequency: uri,
    };

    fetch('http://localhost:3000/api/tension', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        alert('Data sent successfully');
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Select String Thickness:</Text>
      <Picker
        selectedValue={thickness}
        onValueChange={(itemValue, itemIndex) => setThickness(itemValue)}
        style={{ height: 50, width: 150 }}
      >
        <Picker.Item label="0.58 mm" value="0.58" />
        <Picker.Item label="0.59 mm" value="0.59" />
        <Picker.Item label="0.60 mm" value="0.60" />
        <Picker.Item label="0.61 mm" value="0.61" />
        <Picker.Item label="0.62 mm" value="0.62" />
        <Picker.Item label="0.63 mm" value="0.63" />
        <Picker.Item label="0.64 mm" value="0.64" />
        <Picker.Item label="0.65 mm" value="0.65" />
        <Picker.Item label="0.66 mm" value="0.66" />
        <Picker.Item label="0.67 mm" value="0.67" />
        <Picker.Item label="0.68 mm" value="0.68" />
        <Picker.Item label="0.69 mm" value="0.69" />
        <Picker.Item label="0.70 mm" value="0.70" />
      </Picker>

      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      />

      {frequency && (
        <Text>Detected Frequency: {frequency} Hz</Text>
      )}

      <Button title="Send Data" onPress={sendData} disabled={!frequency} />
    </View>
  );
}
