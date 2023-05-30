import {
  TextInput,
  TouchableOpacity,
  View,
  Text,
  ImageBackground,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import {useEffect, useState} from 'react';
import images from './Utils/images';
import {vh, vw} from './Utils/dimensions';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import fonts from './Utils/fonts';
import CustomShowDataBox from './src/Component/CustomShoeDataBox';
import SplashScreen from 'react-native-splash-screen';
import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid} from 'react-native';
import {object, string} from 'yup';

const App = () => {
  const [city, setCity] = useState();
  const [data, setData] = useState({});
  const [forcastData, setForcastData] = useState({});
  const [latitude, setLatitude] = useState();
  const [longitute, setLongitude] = useState();
  const [valid, setValid] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const createCity = async () => {
    let userSchema = object({
      city: string()
        .min(3, 'City name should be of minimum three character')
        .required(),
    });
    userSchema.isValid({city: city}).then(function (valid) {
      console.log('Valid', valid);
      setValid(valid);
      valid;
    });
  };
  useEffect(() => {
    SplashScreen.hide();
    const requestLocationPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This App needs to Access your location',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(info => {
            console.log('info', info);
            setLatitude(info.coords.latitude);
            setLongitude(info.coords.longitude);
            getDataByLatAndLon();
          });
        } else {
          Alert.alert('Permission Denied');
        }
      } catch (err) {
        Alert.alert('err', err);
      }
    };
    requestLocationPermission();
  }, [latitude, longitute]);
  const getDataByLatAndLon = () => {
    console.log('latitude', latitude);
    console.log('longitude', longitute);
    setRefreshing(true);
    if (latitude != undefined && longitute != undefined) {
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitute}&units=metric&appid=d491c71f31fa7ec9767a6445da3e4338`,
        )
        .then(function (response) {
          setData(response);
          console.log('data', response);
          setRefreshing(false);
          setValid(true);
          setCity('');
        })
        .catch(function (error) {
          console.log(error);
        });
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitute}&units=metric&appid=d491c71f31fa7ec9767a6445da3e4338`,
        )
        .then(function (response) {
          setForcastData(response);
          console.log('forcastData', forcastData);
        })
        .catch(function (error) {});
    }
  };
  const getDataByCity = () => {
    if (valid) {
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=d491c71f31fa7ec9767a6445da3e4338`,
        )
        .then(function (response) {
          setData(response);
          console.log('data', response);
        })
        .catch(function (error) {
          setValid(false);
          setData({});
          console.log(error);
        });
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=d491c71f31fa7ec9767a6445da3e4338`,
        )
        .then(function (response) {
          setForcastData(response);
          console.log('forcastData', forcastData);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  };

  return (
    <ImageBackground style={style.images} source={images.background}>
      <StatusBar backgroundColor="rgba(5,42,53,2)" />

      <KeyboardAwareScrollView
        style={style.keyboardAppearance}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => getDataByLatAndLon()}
          />
        }>
        <TextInput
          style={style.textInput}
          onChangeText={text => setCity(text.trim())}
          placeholder="Enter City"
          keyboardAppearance="dark"
          value={city}
        />
        {!valid && (
          <Text style={style.validationMessage}>
            Please Enter Valid City Name
          </Text>
        )}
        <TouchableOpacity
          onPress={() => {
            createCity(), getDataByCity();
          }}
          style={style.searchButton}
          activeOpacity={0.6}>
          <Text style={style.searchText}>Search</Text>
        </TouchableOpacity>
        {data['data'] && (
          <>
            <Text style={style.cityName}>{data.data.name}</Text>

            <View style={style.showCurrentTemperatureView}>
              <Text style={style.temperature}>{data.data.main.temp}</Text>
              <Image style={style.degreeCelsius} source={images.celsius} />
            </View>

            <View style={style.currentWeatherTextView}>
              <Text style={style.currentWeatherText}>Weather Forcast</Text>
            </View>
            {forcastData['data'] && (
              <CustomShowDataBox data={forcastData.data.list} />
            )}
          </>
        )}
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};
const style = StyleSheet.create({
  textInput: {
    width: vw(320),
    height: vh(60),
    borderWidth: vw(1),
    borderRadius: vw(8),
    alignSelf: 'center',
    backgroundColor: 'white',
    marginTop: vh(16),
    paddingLeft: vw(16),
    color: 'black',
  },
  mainScreen: {
    flex: 1,
  },
  images: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: vh(780),
    width: vw(360),
  },
  searchButton: {
    width: vw(130),
    height: vh(50),
    borderRadius: vw(8),
    alignSelf: 'center',
    backgroundColor: 'rgb(140,138,101)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vh(16),
  },
  searchText: {
    color: 'white',
    fontSize: vw(16),
    fontFamily: fonts.ibmBold,
  },
  currentWeatherText: {
    // color: 'rgba(230, 242, 119,1)',
    color: 'white',
    marginLeft: vw(16),

    fontSize: vw(29),
    fontFamily: fonts.ibmBold,
  },
  currentWeatherTextView: {
    justifyContent: 'center',
    height: vh(40),
    marginTop: vh(8),
  },
  keyboardAppearance: {
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  temperature: {
    color: 'white',
    fontFamily: fonts.ibmBold,
    fontSize: vw(60),
  },
  degreeCelsius: {
    height: vh(65),
    width: vw(60),
    tintColor: 'white',
  },
  showCurrentTemperatureView: {
    flexDirection: 'row',
    width: vw(360),
    height: vh(150),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityName: {
    color: 'white',
    marginLeft: vw(16),
    fontSize: vw(40),
    fontFamily: fonts.ibmBold,
    marginTop: vh(16),
  },
  validationMessage: {
    color: 'red',
    marginLeft: vw(16),
    fontFamily: fonts.ibmMedium,
    fontSize: vw(18),
    marginTop: vw(8),
  },
});
export default App;
