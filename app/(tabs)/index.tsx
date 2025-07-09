import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleMaps } from 'expo-maps';
import { useEffect, useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import 'react-native-get-random-values';
import EventSource from 'react-native-sse';
import { v4 } from 'uuid';

import driver from '../../assets/images/driver.png';

import * as Location from 'expo-location';

export default function App() {

  const [location, setLocation] = useState<GoogleMaps.Marker>({});
  const [address, setAddress] = useState<Location.LocationGeocodedAddress[] | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [polylineArray, setPolylineArray] = useState([])
  const [eta, setETA] = useState(-1)

  const handleOrder = async () => {
    console.log('called');
    
    const pastorder = await AsyncStorage.getItem('order')
    console.log('pastorder :', pastorder);
    
    let id = null
    if(pastorder == null){
      id = v4()
      console.log(id);
      await AsyncStorage.setItem('order', id)
    }
    else{
      id = pastorder
    }
      
    if(pastorder == null){
      const body = JSON.stringify({
        orderid: id,
        latitude: location?.coordinates?.latitude,
        longitude: location?.coordinates?.longitude
      })
      console.log('body : ', body);
      
      const res = await fetch('http://192.168.1.6:3001/createorder',{
        method:'POST',
        body:body,
        headers:{
          'Content-Type': 'application/json'
        }
      })
    }
      
       const eventsource = new EventSource(`http://192.168.1.6:3003/link/${id}`)

        eventsource.addEventListener('message',async (event) => {
        
        const locdata = JSON.parse(event.data!)
        console.log(locdata);
        if(locdata.ETA === 999) {setETA(eta)}
        else{
          const neweta = Math.ceil(Number(locdata.ETA))
          console.log('rounded: ', neweta);
          
          setETA(neweta)
        }
        const newpoint = {
          latitude: locdata.latitude,
          longitude: locdata.longitude
        }

        setPolylineArray(prev => [...prev, newpoint])
        console.log('1: ', polylineArray);
        
        await AsyncStorage.setItem('route', JSON.stringify(polylineArray))
        console.log('2: ', polylineArray);
        })
  }

  useEffect(() => {
    async function getCurrentLocation() {

      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      console.log(status);
      


      let location = await Location.getCurrentPositionAsync({});
      console.log(location);
      
      const marker = {
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      }
      setLocation(marker);
    }

    getCurrentLocation();
  }, []);

  let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  console.log(polylineArray);

  let cameraCoords = {};
  if(polylineArray.length === 0){
    cameraCoords = {
            latitude: location.coordinates?.latitude,
            longitude: location.coordinates?.longitude
    }
  }
  else{
    cameraCoords = polylineArray.at(-1)!
  }

  console.log(eta);
  

  return (
    <SafeAreaView style={{flex: 1, justifyContent:'center',}}>
      <View style={{ width:'100%', height:'15%', display:'flex',justifyContent:'center', alignItems:'center', backgroundColor:eta === -1 ? 'orange' : eta === 0 ? 'lightgreen' : 'lightblue' }} >
        <Text style={{color:'black', fontSize:25}}>{eta === -1 ? 'Order not picked' : eta === 0 ? 'Your order was delivered' :  eta + ' minutes until arrival' }</Text>
      </View>
      <GoogleMaps.View style={{ flex: 1, position:'relative' }} markers={[
        {
          coordinates: {
            latitude: location.coordinates?.latitude,
            longitude: location.coordinates?.longitude
          }
        },
        {
          coordinates: polylineArray.at(-1),
          icon: driver
        }
      ]}
      
      cameraPosition={         
        {
          coordinates: cameraCoords,
        zoom:18}
        }
        
        polylines={[
          {
            coordinates: polylineArray
          }
        ]}
        />
      <Button title='Create Order' onPress={handleOrder} ></Button>
      <Button title='Reset Route' onPress={async () => {await AsyncStorage.removeItem('route'); setPolylineArray([])}} ></Button>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width:100,
    height:100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
});
