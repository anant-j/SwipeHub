import React, { useState } from "react";
import { View, ImageBackground, TouchableOpacity } from "react-native";
import Icon from "../components/Icon";
import CardStack, { Card } from "react-native-card-stack-swiper";
import { City, Filters, CardItem } from "../components";
import DEMO from "../assets/data/demo";
import styles, {
  DISLIKE_ACTIONS,
  FLASH_ACTIONS,
  LIKE_ACTIONS,
  STAR_ACTIONS,
  WHITE,
} from "../assets/styles";

const Home = () => {
  const [swiper, setSwiper] = useState<CardStack | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ImageBackground
      source={require("../assets/images/bg.png")}
      style={styles.bg}
    >
      <View style={styles.containerHome}>
        <View style={styles.top}>
          <City />
          <Filters />
        </View>

         
        <View style={styles.maincard}>
        <CardStack
          loop
          verticalSwipe={false}
          renderNoMoreCards={() => null}
          ref={(newSwiper): void => setSwiper(newSwiper)}
        >
          {DEMO.map((item) => (
            <Card key={item.id} onSwipedLeft={() => alert('onSwipedLeft')}>
              <CardItem
                hasActions
                image={item.image}
                name={item.name}
                description={item.description}
                matches={item.match}
              />
            </Card>
          ))}
        </CardStack>
        </View>
        <View style={styles.actionsCardItem}>

          <TouchableOpacity style={styles.button} onPress={ () => { swiper.swipeLeft() }}>
            <Icon name="x" color={DISLIKE_ACTIONS} size={25} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={ () => { swiper.swipeRight() }}>
            <Icon name="heart" color={LIKE_ACTIONS} size={25} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={ () => { setModalVisible(!modalVisible) }}>
            <Icon name="info" color={FLASH_ACTIONS} size={25} />
          </TouchableOpacity>


        </View>
      </View>  
    </ImageBackground>
  );
};

export default Home;
