import React, {useState, useContext} from 'react'
import { SafeAreaView, Text, TouchableOpacity, TextInput } from 'react-native'
import * as Location from 'expo-location'
import { useToast, Center } from "native-base";

import { AuthContext } from "../context/AuthProvider";
import PurchaseLocalService from "../services/PurchaseLocalService";

export default function CartScreen() {

    const [name, setName] = useState('')
    const { user } = useContext(AuthContext);

    const toast = useToast();

    const getCoords = async() => {

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            
            toast.show({
                title: "Precisamos de sua permissão para obter a localização",
                status: "warning",
            });
            
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        toast.show({
            title: "Latitude: " + latitude + ", longitude: " + longitude,
            status: "success",
        });

        const purchaseLocal = {name, latitude, longitude}
        await PurchaseLocalService.createPurchaseLocal(purchaseLocal, user);
        
    } 

    return (
        <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>

            <Center mx="auto" my="auto" width="90%" flex={1}>
                <TextInput value={name} onChangeText={setName} autoCorrect={false} 
                    placeholder="Digite o nome do mercado" />

                <TouchableOpacity style={{marginTop: 20, backgroundColor: '#190', padding: 8}} onPress={() => getCoords()}>
                    <Text>Testar Geolocalização</Text>
                </TouchableOpacity>
            </Center>

        </SafeAreaView>
    )
}
