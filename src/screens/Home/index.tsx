import { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

import { api } from "../../services/api";

import { styles } from "./styles";

import { Tip } from "../../components/Tip";
import { Item, ItemProps } from "../../components/Item";
import { Button } from "../../components/Button";
import { isLoaded } from "expo-font";
import { Loading } from "../../components/Loading";
import { foodContain } from "../../utils/foodContain";
import { animalContain } from "../../utils/animalContain";

export function Home() {
   const [selectedImageUri, setSelectedImageUri] = useState("");
   const [isLoading, setIsloading] = useState(false);

   const [itens, setItens] = useState<ItemProps[]>([]);

   const [message, setMessage] = useState("");

   const [animalsOrPlant, setAnimalsOrPlant] = useState("");

   async function handleSelectImage() {
      try {
         const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
         if (status !== ImagePicker.PermissionStatus.GRANTED) {
            return alert(
               "e necessario conseder permissao para acessar sua galeria!"
            );
         }

         setIsloading(true);

         const response = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
         });

         if (response.canceled) {
            return setIsloading(false);
         }

         if (!response.canceled) {
            const imageManipuled = await ImageManipulator.manipulateAsync(
               response.assets[0].uri,
               [{ resize: { width: 900 } }],
               {
                  compress: 1,
                  format: ImageManipulator.SaveFormat.JPEG,
                  base64: true,
               }
            );

            setSelectedImageUri(imageManipuled.uri);
            foodDetect(imageManipuled.base64);
            AnimalDetected(imageManipuled.base64);
         }
      } catch (error) {
         console.log(error);
      }
   }

   async function foodDetect(imageBase64: string | undefined) {
      const response = await api.post(
         `/v2/models/${process.env.EXPO_PUBLIC_API_MODEL_ID}/versions/${process.env.EXPO_PUBLIC_API_MODEL_VERSION_ID}/outputs`,
         {
            user_app_id: {
               user_id: process.env.EXPO_PUBLIC_API_USER_ID,
               app_id: process.env.EXPO_PUBLIC_API_APP_ID,
            },
            inputs: [
               {
                  data: {
                     image: {
                        base64: imageBase64,
                     },
                  },
               },
            ],
         }
      );
      const foods = response.data.outputs[0].data.concepts.map(
         (concept: any) => {
            return {
               name: concept.name,
               percentage: `${Math.round(concept.value * 100)}%`,
            };
         }
      );

      const isVegetable = foodContain(foods, "vegetable");
      setMessage(isVegetable ? "" : "Adicione vegetais ao seu prato!");

      setItens(foods);
      setIsloading(false);
   }

   async function AnimalDetected(imageBase64: string | undefined) {
      const response = await api.post(
         `/v2/models/${process.env.EXPO_PUBLIC_API_MODEL_ID}/versions/${process.env.EXPO_PUBLIC_API_MODEL_VERSION_ID}/outputs`,
         {
            user_app_id: {
               user_id: process.env.EXPO_PUBLIC_API_USER_ID,
               app_id: process.env.EXPO_PUBLIC_API_APP_ID,
            },
            inputs: [
               {
                  data: {
                     image: {
                        base64: imageBase64,
                     },
                  },
               },
            ],
         }
      );
      const animals = response.data.outputs[0].data.concepts.map(
         (concept: any) => {
            return {
               name: concept.name,
               percentage: `${Math.round(concept.value * 100)}%`,
            };
         }
      );

      const isAnimal = animalContain(animals, "animal");
      setAnimalsOrPlant(isAnimal ? animals[0].name : "nao é animal");

      setItens(animals);
      console.log(animals);
      setIsloading(false);
   }

   return (
      <View style={styles.container}>
         <View style={{ justifyContent: "flex-end", flexDirection: "row" }}>
            <Button onPress={handleSelectImage} disabled={isLoading} />
         </View>

         {selectedImageUri ? (
            <Image
               source={{ uri: selectedImageUri }}
               style={styles.image}
               resizeMode="cover"
            />
         ) : (
            <Text style={styles.description}>
               Selecione a foto do seu prato para analizar.
            </Text>
         )}

         <View style={styles.bottom}>
            {isLoading ? (
               <Loading />
            ) : (
               <>
                  {message ? (
                     <Tip message={message} />
                  ) : (
                     <Tip message="Aqui vai uma dica!" />
                  )}
                  <Tip message={animalsOrPlant} />

                  <ScrollView
                     showsVerticalScrollIndicator={false}
                     contentContainerStyle={{ paddingVertical: 24 }}
                  >
                     <View style={styles.items}>
                        {itens.map((item, index) => (
                           <Item key={index} data={item} />
                        ))}
                     </View>
                  </ScrollView>
               </>
            )}
         </View>
      </View>
   );
}
