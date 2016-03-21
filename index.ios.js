/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

let React = require("react-native") 

let {
  AppRegistry,
  NavigatorIOS,
  Component,
  StyleSheet,
  Text,
  View
} = React;

let SearchScreen = React.createClass({
  render() {
    return (
      <View style={styles.welcome}>
        <Text style={styles.instructions}>
          Welcome to React Native!
          To get started, edit index.ios.js
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
          you know what happened!
       </Text> 
      </View>
    );
  }
});
let AzfProject = React.createClass({
  render() {
    return (
    //复合组件
     <NavigatorIOS
          style={styles.container}
          initialRoute={{
            title: 'MoviesSearch',
            component: SearchScreen,
          }} />
    );
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    color: '#333333',
    marginTop:200,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('AzfProject', () => AzfProject);

module.exports = AzfProject;
