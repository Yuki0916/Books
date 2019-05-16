/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  Text,
  View,
  Button,
  TextInput,
  TouchableHighlight,
} from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import Moment from 'moment';

type Props = {};
const ISBN = () => {
  const getRandomNumber = () => Math.floor(Math.random() * Math.floor(10));
  const FirstStr = getRandomNumber();
  const SecondStr0 = getRandomNumber();
  const SecondStr1 = getRandomNumber();
  const SecondStr2 = getRandomNumber();
  const SecondStr3 = getRandomNumber();
  const ThirdStr0 = getRandomNumber();
  const ThirdStr1 = getRandomNumber();
  const ThirdStr2 = getRandomNumber();
  const ThirdStr3 = getRandomNumber();
  const CheckNumber = (
    input = (FirstStr * 10 +
      SecondStr0 * 9 +
      SecondStr1 * 8 +
      SecondStr2 * 7 +
      SecondStr3 * 6 +
      ThirdStr0 * 5 +
      ThirdStr1 * 4 +
      ThirdStr2 * 3 +
      ThirdStr3 * 2) %
      11
  ) => {
    if (input === 0) return 0;
    else if (input === 1) return 'X';
    else return 11 - input;
  };

  const ISBN = `${FirstStr}-${SecondStr0}${SecondStr1}${SecondStr2}${SecondStr3}-${ThirdStr0}${ThirdStr1}${ThirdStr2}${ThirdStr3}-${CheckNumber()}`;
  return ISBN;
};
const BookPath = /\/books\//;
class App extends Component<Props> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerRight: (
        <Button
          onPress={() => navigation.navigate('EditPage')}
          title="New"
          color="#fff"
        />
      ),
      headerStyle: {
        backgroundColor: '#ffc360',
      },
    };
  };

  state = {
    dataSource: [],
  };

  componentDidMount() {
    return fetch('https://demo.api-platform.com/books/')
      .then(response => response.json())
      .then(responseJson => {
        this.setState({
          dataSource: !responseJson['hydra:member']
            ? []
            : responseJson['hydra:member'],
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!!this.props.navigation.state.params && prevState === this.state) {
      this.setState({
        dataSource: this.props.navigation.state.params.NewBooksInfo,
      });
      return true;
    }
    return false;
  }

  render() {
    const booksListArr = this.state.dataSource.map((item, index) => (
      <TouchableHighlight
        key={index}
        style={{
          width: 150,
          height: 150,
          backgroundColor: '#fff',
          marginTop: '5%',
        }}
        title="123"
        onPress={() =>
          this.props.navigation.navigate('BookContent', { BookInfo: item })
        }
      >
        <View>
          <Text>{item.title + '\n'}</Text>
          <Text>{item.author + '\n'}</Text>
          <Text>
            {Moment(item.publicationDate).format('YYYY-MM-DD') + '\n'}
          </Text>
          <Button
            title="Delete"
            onPress={() => {
              Promise.all([
                fetch(
                  `https://demo.api-platform.com/books/${item['@id'].replace(
                    BookPath,
                    ''
                  )}`,
                  {
                    method: 'DELETE',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                  }
                ),
                fetch('https://demo.api-platform.com/books/'),
              ]).then(async ([firstRes, secondRes]) => {
                const NewBooksInfo = await secondRes.json();
                this.setState({ dataSource: NewBooksInfo['hydra:member'] });
              });
            }}
          />
        </View>
      </TouchableHighlight>
    ));
    return (
      <View
        style={{
          backgroundColor: '#f5f5f5',
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
          alignItems: 'flex-start',
        }}
      >
        {booksListArr}
      </View>
    );
  }
}

class EditPage extends Component {
  static navigationOptions = ({ navigation }) => {
    const BookInfo = !navigation.state.params
      ? null
      : navigation.state.params.BookInfo;
    const modifyBookInfo = () => {
      if (!navigation.state.params.state) return;
      Promise.all([
        fetch(
          `https://demo.api-platform.com/books/${BookInfo['@id'].replace(
            BookPath,
            ''
          )}`,
          {
            method: 'PUT',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              isbn: BookInfo.isbn,
              title: navigation.state.params.state.Title,
              description: navigation.state.params.state.Description,
              author: navigation.state.params.state.Author,
              publicationDate: BookInfo.publicationDate,
              IRIs: [
                {
                  body: 'string',
                  rating: 0,
                  letter: 'string',
                  author: 'string',
                  publicationDate: BookInfo.publicationDate,
                },
              ],
            }),
          }
        ),
        fetch('https://demo.api-platform.com/books/'),
      ]).then(async ([firstRes, secondRes]) => {
        const NewBooksInfo = await secondRes.json();
        navigation.navigate('Home', {
          NewBooksInfo: NewBooksInfo['hydra:member'],
        });
      });
    };
    const addBookInfo = () => {
      if (!navigation.state.params) return;
      Promise.all([
        fetch('https://demo.api-platform.com/books/', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isbn: ISBN(),
            title: navigation.state.params.state.Title,
            description: navigation.state.params.state.Description,
            author: navigation.state.params.state.Author,
            publicationDate: Moment().toISOString(),
            IRI: [
              {
                body: 'string',
                rating: 0,
                letter: 'string',
                author: 'string',
                publicationDate: Moment().toISOString(),
              },
            ],
          }),
        }),
        fetch('https://demo.api-platform.com/books/'),
      ]).then(async ([firstRes, secondRes]) => {
        const NewBooksInfo = await secondRes.json();
        console.log('add api, NewBooksInfo');
        navigation.navigate('Home', {
          NewBooksInfo: NewBooksInfo['hydra:member'],
        });
      });
    };
    return {
      title: !BookInfo ? 'Add new book' : BookInfo.title,
      headerLeft: (
        <Button onPress={() => navigation.goBack()} title="Back" color="#fff" />
      ),
      headerRight: (
        <Button
          onPress={() => (!BookInfo ? addBookInfo() : modifyBookInfo())}
          title="Save"
          color="#fff"
        />
      ),
      headerTintColor: '#fff',
      headerStyle: {
        backgroundColor: '#ffc360',
      },
    };
  };

  state = {
    Author: '',
    Title: '',
    Description: '',
  };

  componentDidMount() {
    const BookInfo = !this.props.navigation.state.params
      ? null
      : this.props.navigation.state.params.BookInfo;
    if (!!BookInfo)
      this.setState({
        Title: !BookInfo.title ? '' : BookInfo.title,
        Author: !BookInfo.author ? '' : BookInfo.author,
        Description: !BookInfo.description ? '' : BookInfo.description,
      });
    this.props.navigation.setParams({
      state: this.getStateInfo(),
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState !== this.state) {
      this.props.navigation.setParams({
        state: this.getStateInfo(),
      });
      return true;
    }
    return false;
  }

  getStateInfo = () => ({
    Author: this.state.Author,
    Title: this.state.Title,
    Description: this.state.Description,
  });
  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#f5f5f5',
        }}
      >
        <TextInput
          style={{
            backgroundColor: 'white',
            marginTop: '5%',
            marginRight: '5%',
            marginLeft: '5%',
            height: '5%',
          }}
          placeholder={'Title'}
          onChangeText={text => this.setState({ Title: text })}
          value={this.state.Title}
        />
        <TextInput
          style={{
            backgroundColor: 'white',
            marginTop: '5%',
            marginRight: '5%',
            marginLeft: '5%',
            height: '5%',
          }}
          placeholder={'Author'}
          onChangeText={text => this.setState({ Author: text })}
          value={this.state.Author}
        />
        <TextInput
          style={{
            backgroundColor: 'white',
            marginTop: '5%',
            marginRight: '5%',
            marginLeft: '5%',
            height: '50%',
          }}
          onChangeText={text => this.setState({ Description: text })}
          value={this.state.Description}
        />
      </View>
    );
  }
}

class BookContent extends Component {
  static navigationOptions = ({ navigation }) => {
    const BookInfo = !navigation.state.params
      ? null
      : navigation.state.params.BookInfo;
    return {
      title: BookInfo.title,
      headerTintColor: '#fff',
      headerRight: (
        <Button
          onPress={() =>
            navigation.navigate('EditPage', { BookInfo: BookInfo })
          }
          title="Edit"
          color="#fff"
        />
      ),
      headerLeft: (
        <Button
          onPress={() => navigation.navigate('Home')}
          title="Back"
          color="#fff"
        />
      ),
      headerStyle: {
        backgroundColor: '#ffc360',
      },
    };
  };
  render() {
    const BookInfo = !this.props.navigation.state.params
      ? null
      : this.props.navigation.state.params.BookInfo;
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Text
          style={{
            color: '#bebebe',
            marginTop: '3%',
          }}
        >
          {'Author: ' + BookInfo.author}
        </Text>
        <Text
          style={{
            color: '#bebebe',
            marginTop: '3%',
          }}
        >
          {Moment(BookInfo.publicationDate).format('YYYY-MM-DD')}
        </Text>
        <Text
          style={{
            color: '#000',
            width: '100%',
            marginTop: '3%',
            paddingLeft: '5%',
            paddingRight: '5%',
          }}
        >
          {BookInfo.description}
        </Text>
      </View>
    );
  }
}

const AppNavigator = createStackNavigator(
  {
    Home: App,
    EditPage: EditPage,
    BookContent: BookContent,
  },
  {
    initialRouteName: 'Home',
  }
);

export default createAppContainer(AppNavigator);
