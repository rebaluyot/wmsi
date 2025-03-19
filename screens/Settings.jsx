import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Button } from 'react-native-paper'

const Settings = () => {
  
  const [formData, setFormData] = useState({ company: '', account: '', baseurl: '' });

  const retrieveStorage = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value);
      }
    } catch (error) {
      console.log('error')
    }
  };
  

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      // Store data in AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(formData));
      console.log('Data stored successfully!');
    } catch (error) {
      console.error('Error storing data:', error);
    }
  };

  useEffect(() => {
    const setdata = async () => {
        const setdata = await retrieveStorage('userData')
        if (setdata) {
            setFormData({ company: setdata.company, account: setdata.account, baseurl: setdata.baseurl })
        }
        console.log(setdata)
    } 
    setdata()
  },[])

  return (
    <View className='flex justify-center space-x-2 p-3'>
      <TextInput
        placeholder="Input company code here"
        value={formData.company}
        mode="outlined"
        label='COMPANY:'
        onChangeText={(text) => handleInputChange('company', text)}
      />
      <TextInput
        placeholder="Input default account here"
        label='ACCOUNT:'
        mode="outlined"
        value={formData.account}
        onChangeText={(text) => handleInputChange('account', text)}
      />
      <TextInput
        placeholder="Enter BASE URL info."
        label='BASE URL:'
        mode="outlined"
        value={formData.baseurl}
        onChangeText={(text) => handleInputChange('baseurl', text)}
      />
      <Button onPress={handleSubmit} >Save</Button>
    </View>
  );
};

export default Settings;
