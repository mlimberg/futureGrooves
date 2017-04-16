import React, { Component } from 'react';
import { Link } from 'react-router';
import TrackRack from './SequencerComponents/TrackRack'
import Wad from 'web-audio-daw'
import update from 'immutability-helper'
// import Wad from '../../../vendor/wad.js'
import './sequencer-style'
import Slider from '../SoundMaker/Slider'
import SoundMakerContainer from '../../containers/SoundMakerContainer';


export class Sequencer extends Component {
  constructor() {
    super();
    this.state = {
      playPause: false,
      currentStep: 0,
      newSound: '',
      spec: {
        tempo: 160,
        trackRacks: {
          snare:{
            steps:[{play:true, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:true, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:true, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:true, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''}],
            mute: false,
            sound:{
             source : 'noise',
             volume: .5,
             pitch: 'A4',
              env : {
                  attack : .001,
                  decay : .12,
                  sustain : .3,
                  hold : .07,
                  release : .02
              },
              filter : {
                  type : 'highpass',
                  frequency : 300,
                  q : .180
              }
            }
          },
          snap:{
            steps:[{play:true, pitch:"A5"},{play:true, pitch:'B5'},{play:true, pitch:'C5'},{play:true, pitch:'D5'},{play:true, pitch:'E5'},{play:true, pitch:'D5'},{play:true, pitch:'C5'},{play:true, pitch:'B5'},{play:true, pitch:''},{play:true, pitch:''},{play:true, pitch:''},{play:true, pitch:''},{play:true, pitch:''},{play:true, pitch:''},{play:true, pitch:''},{play:true, pitch:''}],
            mute: false,
            sound:{
             source : 'sine',
             volume: .5,
             pitch: 'A4',
              env : {
                  attack : .001,
                  decay : .12,
                  sustain : .3,
                  hold : .07,
                  release : .02
              },
              filter : {
                  type : 'highpass',
                  frequency : 300,
                  q : .180
              }
            }
          },
        },
      }
    }
  }

  componentDidMount() {
    this.fetchUserData()
    this.playLoop()
  }

  fetchUserData() {
    this.props.fetchUserData(this.props.user.id, this.props.user.token)
  }

  playPause() {
    this.setState({ playPause: !this.state.playPause })
  }

  playLoop() {
    this.playStep()
    setTimeout(this.playLoop.bind(this),this.state.tempo)
  }

  playStep() {
    if (this.state.playPause) {
      Object.keys(this.state.spec.trackRacks).forEach((key)=>{
        if(this.state.spec.trackRacks[key].steps[this.state.currentStep].play && (!this.state.spec.trackRacks[key].mute)){
          let wad = new Wad (this.state.spec.trackRacks[key].sound)
          let pitch = (this.state.spec.trackRacks[key].steps[this.state.currentStep].pitch !== '') ? this.state.spec.trackRacks[key].steps[this.state.currentStep].pitch : this.state.spec.trackRacks[key].sound.pitch
            wad.play({pitch: pitch})
        }
      })
      if (this.state.currentStep < 15) {
        this.setState({currentStep: this.state.currentStep + 1})
      } else {
        this.setState({currentStep: 0})
      }
    }
  }

  toggleStep(key, index) {
    let newRack = this.state.spec.trackRacks
    newRack[key].steps[index].play = !newRack[key].steps[index].play
    this.setState({ trackRacks: newRack })
  }

  addTrack(newSound) {
    const soundFromDB = this.props.user.sounds.find((sound)=>{
      const soundValue = JSON.parse(sound.attributes);
      if(soundValue.soundName === newSound) {
        return true
      }
    })

    const soundAttributes = JSON.parse(soundFromDB.attributes)
    let soundObject = {steps:[{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''},{play:false, pitch:''}],
    mute: false}
    Object.assign(soundObject, {sound: soundAttributes})
    let newRack = this.state.spec.trackRacks
    Object.assign(newRack, {[soundAttributes.soundName]:soundObject})
    this.setState({ trackRacks: newRack })
  }

  removeTrack(trackName) {
    delete this.state.spec.trackRacks[trackName]
    this.forceUpdate()
  }

  changeVolume(key, newVolume) {
    let newRack = this.state.spec.trackRacks
    newRack[key].sound.volume = parseFloat(newVolume)
    this.setState({ trackRacks: newRack })
  }

  changeFilter(key, newFreq) {
    let newRack = this.state.spec.trackRacks
    newRack[key].sound.filter.frequency = parseFloat(newFreq)
    this.setState({ trackRacks: newRack })
  }

  changePitch(key, index, newPitch) {
    let newRack = this.state.spec.trackRacks
    newRack[key].steps[index].pitch = newPitch.toUpperCase()
    this.setState({ trackRacks: newRack })
  }

  muteTrack(key) {
    let newRack = this.state.spec.trackRacks;
    newRack[key].mute = !newRack[key].mute;
    this.setState({ trackRacks: newRack})
  }

  soloTrack(key) {
    let newRack = this.state.spec.trackRacks;
    Object.keys(newRack).forEach((rack)=> {
      if (rack !== key) {
        newRack[rack].mute = !newRack[rack].mute
      }
    })
  }

  updateTempo(newTempo) {
    this.setState({tempo: newTempo})
  }

  saveComp = () => {
    const {username, selectedSound} = this.props.user
    const { editsound } = this.props.sound
    if(username) {
    if(selectedSound){
      this.fetchType('PATCH', this.props.user.sound_id)
      return
    }
    if(editsound) {
      this.fetchType('PATCH', this.state.id)
      return
    } else {
      this.fetchType('POST')
      return
    }
  } else {
    alert('Please Sign In')
  }
}

  fetchType(method, sound_id = null) {
    let soundName = prompt('What do you want to call your sound')
    let fType = this.setState(update(this.state, { spec: { soundName: { $set: soundName } } }), () => this.props.saveComp(JSON.stringify(this.state.spec), this.props.user.id, method , sound_id))
    this.setState({ savedchanges: true })
  }

  render() {
    const togglePlayPause = () => {
      return this.state.playPause ? 'Pause' : 'Play'
    }

    return(
      <div id='composition-maker'>
        <div id='play-controls'>
          <button className='btn btn-play' id='play-button' onClick={() => this.playPause()} >
            {togglePlayPause()}
          </button>
          tempo
          <input
            value={this.state.tempo}
            id={'tempo-slider'}
            type='range'
            onChange={(e)=>this.updateTempo(e.target.value)}
            min={100}
            max={400}
            step={1}
          />
          <span>≈{Math.round((60/this.state.tempo)*240)}BPM</span> (this assumes every fourth pad is a beat)
        </div>

        <div id='drum-racks'>
          {Object.keys(this.state.spec.trackRacks).map((trackRack, i) =>
            <TrackRack key={i}
                       name={trackRack}
                       volume={this.state.spec.trackRacks[trackRack].sound.volume}
                       filter={this.state.spec.trackRacks[trackRack].sound.filter.frequency}
                       steps={this.state.spec.trackRacks[trackRack].steps}
                       currentStep={this.state.currentStep}
                       toggleStep={this.toggleStep.bind(this)}
                       changeVolume={this.changeVolume.bind(this)}
                       changeFilter={this.changeFilter.bind(this)}
                       changePitch={this.changePitch.bind(this)}
                       muteTrack={this.muteTrack.bind(this)}
                       soloTrack={this.soloTrack.bind(this)}
                       removeTrack={this.removeTrack.bind(this)}
            />
          )}
        </div>

        <div id='new-sounds'>
          {this.props.user.sounds && <form>
            add track
            <select onChange={(e)=>this.setState({newSound: e.target.value})}>
              {this.props.user.sounds.map((sound, i)=>{
                  const soundValue = JSON.parse(sound.attributes);
                  return(
                    <option value={soundValue.soundName} key={i}>
                      {soundValue.soundName}
                    </option>
                  )
                })
              }
            </select>
            <button className='btn btn-add' onClick={(e) => {e.preventDefault(); this.addTrack(this.state.newSound)}}>add</button>
          </form>}
        </div>
        <div>
          <button className='btn btn-save'> onClick={this.saveComp.bind(this)}>save</button>
        </div>
      </div>
    )
  }
}

export default Sequencer;
