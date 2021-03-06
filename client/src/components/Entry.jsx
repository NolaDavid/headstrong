/* eslint-disable camelcase */
import React, { Component } from 'react';
import axios from 'axios';
import GoogleButton from 'react-google-button';
import { Slider } from '@material-ui/core';
import { Typography } from '@material-ui/core/Typography';
import SentimentSatisfiedAltIcon from '@material-ui/icons/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';

class Entry extends Component {
  constructor(props) {
    super(props);

    const _isMounted = false;

    this.state = {
      title: '',
      blog: '',
      journalImage: '',
      latitude: 0,
      longitude: 0,
      temp: '',
      weatherDescription: '',
      mood: 50
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handlePostChange = this.handlePostChange.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.getWeatherByUserLocation = this.getWeatherByUserLocation.bind(this);
    this.getUserLocation = this.getUserLocation.bind(this);
    this.handleMoodChange = this.handleMoodChange.bind(this);
  }

  // get user's location by ip address
  getUserLocation() {
    //get user's ip address
    return axios.get('https://api.ipify.org')
    // get location data by ip address
      .then(({ data }) => axios.post('/api/location', { ip: data }))
      .then(({ data: { latitude, longitude } }) => {
        this.setState({
          latitude: latitude,
          longitude: longitude
        });
        this.getWeatherByUserLocation(latitude, longitude);
      })
      .catch((err) => console.warn(err));
  }

  // get weather using geolocation
  getWeatherByUserLocation(latitude, longitude) {
    this._isMounted = true;
    axios.post('/api/weather', { latitude, longitude })
      .then(({ data: { data } }) => {
        this._isMounted = false;
        const { temp, weather } = data[ 0 ];
        const { description } = weather;
        const descriptionLowerCase = description.toLowerCase();
        // change temperature to fahrenheit
        const newTemp = Math.round(temp * (9 / 5) + 32);
        this.setState({
          temp: `${ newTemp }°F`,
          weatherDescription: descriptionLowerCase
        });
      })
      .catch((err) => console.warn(err));
  }

  componentDidMount() {
    this.getUserLocation();
  }

  handleTitleChange(e) {
    this.setState({ title: e.target.value });
  }

  handlePostChange(e) {
    this.setState({ blog: e.target.value });
  }

  handleImageChange(e) {
    this.setState({ journalImage: e.target.value });
  }

  handleMoodChange(e, newValue) {
    console.info('newValue', newValue);
    this.setState({ mood: newValue });
  }

  handleSubmit() {
    const { username, title, blog, journalImage, temp, weatherDescription, mood } = this.state;
    axios.post('/api/journals', {
      username: username,
      title: title,
      blog: blog,
      journalImage: journalImage,
      temp: temp,
      weatherDescription: weatherDescription,
      mood: mood
    })
      .then((data) => console.info(data))
      .catch((err) => console.warn(err));
  }

  render() {

    const { title, blog, journalImage, temp, weatherDescription, mood } = this.state;
    //slider values
    const mark = [
      { value: 50 },
      { value: 100 }
    ];

    //slider styling
    const muiTheme = createMuiTheme({
      overrides: {
        MuiSlider: {
          thumb: {
            color: '#95cff4',
          },
          track: {
            color: 'Aqua'
          },
          rail: {
            color: 'Aquamarine'
          }
        }
      }
    });

    return (
        <div className="text wrap">

            <form>
                <div className="weather">Currently {temp} and {weatherDescription}</div>
                <div>
                    <textarea className="form-control"
              placeholder="Give your post a title"
              value={ title }
              onChange={ this.handleTitleChange }/>
                </div>
                <br></br>
                <div>
                    <textarea className="form-control"
              placeholder="Enter your journal here..."
              value={ blog }
              onChange={ this.handlePostChange }/>
                </div>
                <br></br>
                <div>
                    <textarea className="form-control"
              placeholder="Paste image URL here"
              value={ journalImage }
              onChange={ this.handleImageChange }/>
                </div>
                <button className="urlButton" onClick={ () => this.handleSubmit() }>Submit</button>
                {
            journalImage.length ? <img style={ { height: '200px', width: '300px' } } src={ journalImage } /> : null
          }

            </form>

            <div>
                <h3><center>What's your mood like today?</center></h3>

                <div className="slider" style={ { width: 300, marginLeft: 70 } }>
                    <ThemeProvider theme={ muiTheme }>
                        <Grid container className="grid" display="flex" align="center" justify="center" alignItems="center">
                            <Grid item>
                                <SentimentVeryDissatisfiedIcon/>
                            </Grid>
                            <Grid item xs={ 10 }>
                                <Slider onChange={ this.handleMoodChange } className="slider"
                    value={ mood }
                    max={ 100 }
                    marks={ mark }
                    step={ 25 }
                    valueLabelDisplay="auto"
                  />
                            </Grid>
                            <Grid item>
                                <SentimentSatisfiedAltIcon/>
                            </Grid>

                        </Grid>
                    </ThemeProvider>
                </div>
            </div>
        </div>
    );
  }
}

export default Entry;
