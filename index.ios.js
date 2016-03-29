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


var SearchScreen = require('./SearchScreen');

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
    fontSize: 22,
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
