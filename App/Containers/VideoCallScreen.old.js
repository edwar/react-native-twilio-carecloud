import React, { Component } from 'react'
import {
  Text,
  View,
  StyleSheet, 
  TextInput,
  Button,
  TouchableOpacity,
  PermissionsAndroid,
  Alert
} from 'react-native'
import { connect } from 'react-redux'
import {
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
  TwilioVideo
} from 'react-native-twilio-video-webrtc'
// Add Actions - replace 'Your' with whatever your reducer is called :)
// import YourActions from '../Redux/YourRedux'
import TwilioActions from '../Redux/TwilioRedux'

// Styles
// import styles from './Styles/VideoCallScreenStyle'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  callContainer: {
    flex: 1,
    position: "absolute",
    bottom: 0,
    top: 0,
    left: 0,
    right: 0
  },
  welcome: {
    fontSize: 30,
    textAlign: 'center',
    paddingTop: 40
  },
  input: {
    height: 50,
    borderWidth: 1,
    marginRight: 70,
    marginLeft: 70,
    marginTop: 50,
    textAlign: 'center',
    backgroundColor: 'white'
  },
  button: {
    marginTop: 100
  },
  localVideo: {
    flex: 1,
    width: 150,
    height: 250,
    position: "absolute",
    right: 10,
    bottom: 10
  },
  remoteGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: 'wrap'
  },
  remoteVideo: {
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    width: 100,
    height: 120,
  },
  optionsContainer: {
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
    height: 100,
    backgroundColor: 'blue',
    flexDirection: "row",
    alignItems: "center"
  },
  optionButton: {
    width: 60,
    height: 60,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 100 / 2,
    backgroundColor: 'grey',
    justifyContent: 'center',
    alignItems: "center"
  }
});

class VideoCallScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isAudioEnabled: true,
      isVideoEnabled: true,
      status: 'disconnected',
      participants: new Map(),
      videoTracks: new Map(),
      remoteVideo: null,
      roomName: '',
      name: '',
      token: ''
    }
  }

  componentWillReceiveProps(nextprops) {
    const { getVideoCallTokenStatus } = nextprops

    if (getVideoCallTokenStatus && !getVideoCallTokenStatus.fetching) {
      if (getVideoCallTokenStatus.payload) {
        this.setState({
          status: 'connecting',
          token: getVideoCallTokenStatus.payload.token,
        }, () => {
          this.refs.twilioVideo.connect({ roomName: this.state.roomName, accessToken: this.state.token })
        })
      }
    }
  }

  _onConnectButtonPress = async () => {
    try {
      const grantedCamera = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {'title': 'Solicitud de permisos de camara', 'message': 'La aplicacion necesita permisos para acceder a la camara.'}
      )

      const grantedAudio = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {'title': 'Solicitud de permisos de audio', 'message': 'La aplicacion necesita permisos para acceder al audio.'}
      )
      if (
        grantedCamera === PermissionsAndroid.RESULTS.GRANTED &&
        grantedAudio === PermissionsAndroid.RESULTS.GRANTED
      ) {
        this.props.getVideoCallToken({ name: this.state.name, room: this.state.roomName })
      } else {
        Alert.alert("Camera permission denied")
      }
    } catch (err) {
      Alert.alert('Error', err)
    }
  }

  _onEndButtonPress = () => {
    this.refs.twilioVideo.disconnect()
  }

  _onMuteButtonPress = () => {
    this.refs.twilioVideo.setLocalAudioEnabled(!this.state.isAudioEnabled)
      .then(isEnabled => this.setState({ isAudioEnabled: isEnabled }))
  }

  _onFlipButtonPress = () => {
    this.refs.twilioVideo.flipCamera()
  }

  _onRoomDidConnect = () => {
    this.setState({ status: 'connected' })
  }

  _onRoomDidDisconnect = ({ roomName, error }) => {
    console.tron.log('==== ROOM DISCONECT ====')
    console.tron.error(error)

    this.setState({ status: 'disconnected' })
  }

  _onRoomDidFailToConnect = (error) => {
    console.tron.log("==== ROOM ERROR ====")
    console.tron.error(error)

    this.setState({ status: 'disconnected' })
  }

  _onParticipantAddedVideoTrack = ({ participant, track }) => {
    console.tron.log('==== ADD PARTICIPANT VIDEO ====')
    console.tron.log(participant)
    console.tron.log(track)
    // console.tron.log("onParticipantAddedVideoTrack: ", participant, track)

    this.setState({
      videoTracks: new Map([
        ...this.state.videoTracks,
        [track.trackSid, { participantSid: participant.sid, videoTrackSid: track.trackSid }]
      ]),
      remoteVideo: {
        participantSid: participant.sid,
        videoTrackSid: track.trackSid
      }
    });
  }

  _onParticipantRemovedVideoTrack = ({ participant, track }) => {
    console.tron.log('==== REMOTE PARTICIPANT VIDEO ====')
    console.tron.log(participant)
    console.tron.log(track)
    // console.tron.log("onParticipantRemovedVideoTrack: ", participant, track)

    const videoTracks = this.state.videoTracks
    videoTracks.delete(track.trackSid)

    this.setState({ videoTracks: new Map([...videoTracks]), remoteVideo: null });
  }

  render() {
    const { status } = this.state
    if (status === 'disconnected') {
      return (
        <View style={styles.container}>
          <View>
            <Text style={styles.welcome}>
              React Native Twilio Video
            </Text>
            <TextInput
              style={styles.input}
              autoCapitalize='none'
              value={this.state.roomName}
              onChangeText={(text) => this.setState({ roomName: text })}>
            </TextInput>
            <TextInput
              style={styles.input}
              autoCapitalize='none'
              value={this.state.name}
              onChangeText={(text) => this.setState({ name: text })}>
            </TextInput>
            <Button
              title="Connect"
              style={styles.button}
              onPress={this._onConnectButtonPress}>
            </Button>
          </View>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <View style={styles.callContainer}>
          {
            this.state.status === 'connected' &&
            <View style={styles.remoteGrid}>
              {
                // Array.from(this.state.videoTracks, ([trackSid, trackIdentifier]) => {
                //   return (
                //     <TwilioVideoParticipantView
                //       style={styles.remoteVideo}
                //       key={trackSid}
                //       trackIdentifier={trackIdentifier}
                //     />
                //   )
                // })
                this.state.remoteVideo !== null && (
                  <TwilioVideoParticipantView
                    style={styles.remoteVideo}
                    key={this.state.remoteVideo.participantSid}
                    trackIdentifier={this.state.remoteVideo}
                  />
                )
              }
            </View>
          }
          <View
            style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={this._onEndButtonPress}>
              <Text style={{ fontSize: 12 }}>End</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={this._onMuteButtonPress}>
              <Text style={{ fontSize: 12 }}>{this.state.isAudioEnabled ? "Mute" : "Unmute"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={this._onFlipButtonPress}>
              <Text style={{ fontSize: 12 }}>Flip</Text>
            </TouchableOpacity>
            <TwilioVideoLocalView
              enabled={true}
              style={styles.localVideo}
            />
          </View>
        </View>

        <TwilioVideo
          ref="twilioVideo"
          onRoomDidConnect={this._onRoomDidConnect}
          onRoomDidDisconnect={this._onRoomDidDisconnect}
          onRoomDidFailToConnect={this._onRoomDidFailToConnect}
          onParticipantAddedVideoTrack={this._onParticipantAddedVideoTrack}
          onParticipantRemovedVideoTrack={this._onParticipantRemovedVideoTrack}
        />
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    getVideoCallTokenStatus: state.twilio.getTwilioToken
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getVideoCallToken: (params) => dispatch(TwilioActions.getTwilioTokenRequest(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoCallScreen)
