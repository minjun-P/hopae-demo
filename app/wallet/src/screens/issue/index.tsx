import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import React, { FC, useEffect } from 'react';
import { Alert, Dimensions, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dummyEncrypt, encrypt, extractData } from '@/utils/jwt';
import axios from 'axios';
import { holderDid } from '@/common/const';

const dummyNonce = 'nonce1';

type IssueScreenProps = NativeStackScreenProps<RootStackParamList, 'Issue'>;
const IssueScreen: FC<IssueScreenProps> = ({ navigation, route }) => {
  const vw = Dimensions.get('window').width;
  const saveVC = async (vc: string) => {
    await AsyncStorage.removeItem('credentials');
    console.log(vc);
    const data = await extractData(vc);
    if (!data) {
      Alert.alert(
        '인증서가 잘못된 형식입니다',
        '',
        [
          {
            text: '확인',
            onPress: () => {
              navigation.navigate('Home');
            },
          },
        ],
        {
          cancelable: true,
          onDismiss: () => {
            navigation.navigate('Home');
          },
        },
      );
      return;
    }
    const credentials = await AsyncStorage.getItem('credentials');
    let credentialsArr = credentials ? JSON.parse(credentials) : [];
    await AsyncStorage.setItem(
      'credentials',
      JSON.stringify([...credentialsArr, vc]),
    );
    Alert.alert(
      '인증서가 발급되었습니다',
      '',
      [
        {
          text: '확인',
          onPress: () => {
            navigation.navigate('Home');
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          navigation.navigate('Home');
        },
      },
    );
  };

  useEffect(() => {
    if (!route.params.url || !route.params.randomString) {
      Alert.alert(
        '비정상적인 접근입니다',
        '',
        [
          {
            text: '확인',
            onPress: () => {
              navigation.navigate('Home');
            },
          },
        ],
        {
          cancelable: true,
          onDismiss: () => {
            navigation.navigate('Home');
          },
        },
      );
      return;
    }

    const _inner = async () => {
      // const encrypted = await encrypt(dummyNonce);
      console.log(route.params.url);
      axios
        .post(route.params.url, {
          holderDid: holderDid,
          orignalNonce: dummyNonce,
          encryptedNonce: dummyEncrypt(dummyNonce),
        })
        .then((res) => {
          saveVC(res.data)
            .then(() => {
              Alert.alert('인증서 발급 완료', '인증서 발급이 완료되었습니다.');
            })
            .catch((e) => {
              console.error(e);
              Alert.alert('인증서 저장에 실패했습니다');
            })
            .finally(() => {
              navigation.goBack();
            });
        })
        .catch((e) => {
          console.log(e);
        });
    };
    _inner();
  }, [route.params]);

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
      <View
        style={{
          width: vw - 32,
          justifyContent: 'center',
          padding: 16,
        }}>
        <Text style={{ fontSize: 28, color: 'black' }}>
          {'인증서를 발급중입니다...'}
        </Text>
      </View>
    </View>
  );
};

export default IssueScreen;
