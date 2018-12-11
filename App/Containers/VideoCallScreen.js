import React, { Component } from 'react'
import { Text, View, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native'
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
import styles from './Styles/VideoCallScreenStyle'
import { Colors } from '../Themes';

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
          name: getVideoCallTokenStatus.payload.name,
          roomName: getVideoCallTokenStatus.payload.room
        }, () => {
          this.refs.twilioVideo.connect({ roomName: this.state.roomName, accessToken: this.state.token })
        })
      }
    }
  }

  componentDidMount() {

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

    this.setState({ status: 'disconnected' }, () => {
      this.props.navigation.goBack()
    })
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

    this.setState({
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

    this.setState({ remoteVideo: null });
  }

  render() {
    const { status, remoteVideo, isAudioEnabled } = this.state
    return (
      <View style={styles.container}>
        <TwilioVideo
          ref="twilioVideo"
          onRoomDidConnect={this._onRoomDidConnect}
          onRoomDidDisconnect={this._onRoomDidDisconnect}
          onRoomDidFailToConnect={this._onRoomDidFailToConnect}
          onParticipantAddedVideoTrack={this._onParticipantAddedVideoTrack}
          onParticipantRemovedVideoTrack={this._onParticipantRemovedVideoTrack}
        />
        <View style={styles.callContainer}>
          {
            status === 'connected' &&
            <View style={styles.remoteGrid}>
              {
                remoteVideo !== null && (
                  <TwilioVideoParticipantView
                    style={styles.remoteVideo}
                    key={remoteVideo.participantSid}
                    trackIdentifier={remoteVideo}
                  />
                )
              }
            </View>
          }
          <View
            style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: Colors.error }]}
              onPress={this._onEndButtonPress}>
              <Text style={{ fontSize: 12, color: Colors.snow }}>End</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: Colors.facebook }]}
              onPress={this._onMuteButtonPress}>
              <Text style={{ fontSize: 12, color: Colors.snow }}>{isAudioEnabled ? "Mute" : "Unmute"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: Colors.bloodOrange }]}
              onPress={this._onFlipButtonPress}>
              <Text style={{ fontSize: 12, color: Colors.snow }}>Flip</Text>
            </TouchableOpacity>
            <TwilioVideoLocalView
              enabled={true}
              style={styles.localVideo}
            />
          </View>
        </View>
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
