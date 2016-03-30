'use strict';
var React = require('react-native');

let {
  View,
  Text,
  StyleSheet,
  ListView,
  Platform,
  Image,
  ActivityIndicatorIOS,
  ProgressBarAndroid,
} = React;

var TimerMixin = require('react-timer-mixin');

var MovieCell = require('./MovieCell');
var MovieScreen = require('./MovieScreen');
var SearchBar = require('SearchBar');

var API_URL = 'http://api.rottentomatoes.com/api/public/v1.0/';
var API_KEYS = [
  '7waqfqbprs7pajbz28mqf6vz',
  // 'y4vwv8m33hed9ety83jmv52f', Fallback api_key
];

var API_KEY = '7waqfqbprs7pajbz28mqf6vz';
var TOTAL_API_URL = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json';

//first request url
var PAGE_SIZE = 25;
var PARAMS = '?apikey=' + API_KEY + '&page_limit=' + PAGE_SIZE;
var REQUEST_URL = TOTAL_API_URL + PARAMS;


var resultsCache = {
  dataForQuery: {},
  nextPageNumberForQuery: {},
  totalForQuery: {},
};

var LOADING = {};

let SearchScreen = React.createClass({
  mixins: [TimerMixin],
  timeoutID: (null: any),

  getInitialState: function() {
    return {
      isLoading: false,
      isLoadingTail: false,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      filter: "",
      queryNumber: 0,
      loaded: false,
    };
  },  

  componentWillMount: function() {
    this.searchMovies("");
  },
  componentDidMount: function() {
    
  },

  _urlForQueryAndPage: function(query: string, pageNumber: number): string {
    var apiKey = API_KEYS[this.state.queryNumber % API_KEYS.length];
    var url = TOTAL_API_URL + '?apikey=' + apiKey + '&page_limit=20&page=' + pageNumber;
    if(query) {
      url = API_URL + 'movies.json?apikey=' + apiKey + '&q=' +
      encodeURIComponent(query) + '&page_limit=20&page=' + pageNumber;
    }  
    console.log('test url is ' + url);
    return url;
  },

  searchMovies: function(query : string) {
    this.setState({filter: query});
    let cachedResultsForQuery = resultsCache.dataForQuery[query];
    if (cachedResultsForQuery) {
      if (!LOADING[query]) {
        this.setState({
          dataSource: this.getDataSource(cachedResultsForQuery),
          isLoading: false, 
        });
      } else {
        this.setState({
          isLoading: true, 
        });
      }
      return;
    }

    LOADING[query] = true;
    resultsCache.dataForQuery[query] = null;
    this.setState({
      queryNumber: this.state.queryNumber + 1,
      isLoading: true,
      isLoadingTail: false,
    });

    let page = resultsCache.nextPageNumberForQuery[query];
    let url = this._urlForQueryAndPage(query, 1);
    fetch(url)
      .then((response) => response.json())
      .catch((error) => {
        LOADING[query] = false;
        resultsCache.dataForQuery[query] = undefined;

        this.setState({
          dataSource: this.getDataSource([]),
          isLoading: false, 
        });
      })
      .then((responseData) => {
        LOADING[query] = false;
        console.log(responseData)
        resultsCache.totalForQuery[query] = responseData.total;
        resultsCache.dataForQuery[query] = responseData.movies;
        resultsCache.nextPageNumberForQuery[query] = 2;

        if (this.state.filter !== query) {
          return;
        }

        this.setState({
          isLoading: false,
          dataSource: this.getDataSource(responseData.movies), 
        });
      })
      .done();
  },

  hasMore: function(): boolean {
    var query = this.state.filter;
    if (!resultsCache.dataForQuery[query]) {
      return true;
    }
    return (
      resultsCache.totalForQuery[query] !==
      resultsCache.dataForQuery[query].length
    );
  },

  onEndReached: function() {
    var query = this.state.filter;
    if (!this.hasMore() || this.state.isLoadingTail) {
      console.log('no more data' + this.hasMore());
      // We're already fetching or have all the elements so noop
      return;
    }

    if (LOADING[query]) {
      return;
    }

    LOADING[query] = true;
    this.setState({
      queryNumber: this.state.queryNumber + 1,
      isLoadingTail: true,
    });

    var page = resultsCache.nextPageNumberForQuery[query];
    fetch(this._urlForQueryAndPage(query, page))
      .then((response) => response.json())
      .catch((error) => {
        console.error(error);
        LOADING[query] = false;
        this.setState({
          isLoadingTail: false,
        });
      })
      .then((responseData) => {
        var moviesForQuery = resultsCache.dataForQuery[query].slice();

        LOADING[query] = false;
        // We reached the end of the list before the expected number of results
        if (!responseData.movies) {
          resultsCache.totalForQuery[query] = moviesForQuery.length;
        } else {
          for (var i in responseData.movies) {
            moviesForQuery.push(responseData.movies[i]);
          }
          resultsCache.dataForQuery[query] = moviesForQuery;
          resultsCache.nextPageNumberForQuery[query] += 1;
        }

        if (this.state.filter !== query) {
          // do not update state if the query is stale
          return;
        }

        this.setState({
          isLoadingTail: false,
          dataSource: this.getDataSource(resultsCache.dataForQuery[query]),
        });
      })
      .done();
  },
  getDataSource: function(movies: Array<any>): ListView.DataSource {
    return this.state.dataSource.cloneWithRows(movies)
  },

  fetchData() {
    fetch(REQUEST_URL)
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(responseData.movies),
          loaded: true,
        });
      })
      .done();
  },
  renderMovie(movie) {
    return (
      <View style={styles.container}>
        <Image
          source={{uri: movie.posters.thumbnail}}
          style={styles.thumbnail}
        />
        <View style={styles.rightContainer}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.year}>{movie.year}</Text>
        </View>
      </View>
    );
  },

  renderLoadingView() {
    return (
      <View style={styles.container}>
        <Text>
          Loading movies...ok~~~
        </Text>
      </View>
    );
  },

  selectMovie: function(movie: Object) {
    if (Platform.OS === 'ios') {
      this.props.navigator.push({
        title: movie.title,
        component: MovieScreen,
        passProps: {movie},
      });
    } else {
      dismissKeyboard();
      this.props.navigator.push({
        title: movie.title,
        name: 'movie',
        movie: movie,
      });
    }
  },

  renderSeparator: function(sectionID: number | string,rowID: number | string,
    adjacentRowHighlighted: boolean) {
    var style = styles.rowSeparator;
    if (adjacentRowHighlighted) {
        style = [style, styles.rowSeparatorHide];
    }
    return (
      <View key={'SEP_' + sectionID + '_' + rowID}  style={style}/>
    );
  },

  getDataSource: function(movies: Array<any>): ListView.DataSource {
    return this.state.dataSource.cloneWithRows(movies);
  },

  renderRow: function(
    movie: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
    ) {
    return (
      <MovieCell
        key={movie.id}
        onSelect={() => this.selectMovie(movie)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        movie={movie}
      />
    );
  },

  renderFooter: function() {
    if (!this.hasMore() || !this.state.isLoadingTail) {
      return <View style={styles.scrollSpinner} />;
    }
    if (Platform.OS === 'ios') {
      return <ActivityIndicatorIOS style={styles.scrollSpinner} />;
    } else {
      return (
        <View  style={{alignItems: 'center'}}>
          <ProgressBarAndroid styleAttr="Large"/>
        </View>
      );
    }
  },

  onSearchChange: function(event: Object) {
    var filter = event.nativeEvent.text.toLowerCase();

    this.clearTimeout(this.timeoutID);
    this.timeoutID = this.setTimeout(() => this.searchMovies(filter), 100);
  },

  render: function() {
    let content = "";
    if (this.state.dataSource.getRowCount() === 0) {
      content = this.renderLoadingView();
    }
    content = <ListView
        ref="listview"
        dataSource={this.state.dataSource}
        renderSeparator={this.renderSeparator}
        renderRow={this.renderRow}
        renderFooter={this.renderFooter}
        onEndReached={this.onEndReached}
        style={styles.listView}
      />
    return (
      <View style={styles.container}>
        <SearchBar
          onSearchChange={this.onSearchChange}
          isLoading={this.state.isLoading}
          onFocus={() =>
            this.refs.listview && this.refs.listview.getScrollResponder().scrollTo({ x: 0, y: 0 })}
        />
        <View style={styles.separator} />
        {content}
      </View>
    );
  },
});


var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerText: {
    alignItems: 'center',
  },
  noMoviesText: {
    marginTop: 80,
    color: '#888888',
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  scrollSpinner: {
    marginVertical: 20,
  },
  rowSeparator: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    height: 1,
    marginLeft: 4,
  },
  rowSeparatorHide: {
    opacity: 0.0,
  },
});

module.exports = SearchScreen;