import React, { Component } from 'react'
import { Link } from 'react-router'
import Select from './Select'
import Slider from './Slider'
import update from 'immutability-helper'
import Button from '../Button'

import Toggle from 'react-toggle'


export class SoundMaker extends Component {
  constructor() {
    super()
    this.round = this.round.bind(this)
    this.state = {
      spec: {
        source: 'sine',
        volume: 0.5,
        pitch: 'A4',
        detune: 0,
        panning: 0,
        env: {
          attack: 1,
          decay: 1,
          sustain: 0,
          hold: 0,
          release: 0,
        },
        filter: {
          type: 'allpass',
          frequency: 600,
          q: 1,
          env: {
            frequency: 800,
            attack: 0.5,
          },
        },
        reverb: {
          wet: 1,
          impulse: 'http://localhost:3000/api/v1/impulses?id=BlockInside.wav',
        },
        // delay: {
        //   delayTime: 0.5,
        //   wet: 0.25,
        //   feedback: 0.25,
        // },
        vibrato: {
          shape: 'sine',
          magnitude: 3,
          speed: 4,
          attack: 0,
        },
        // tremolo: {
        //   shape: 'sine',
        //   magnitude: 3,
        //   speed: 4,
        //   attack: 0,
        // },
        tuna: {
          Chorus: {
            rate: 1.5,          // 0.01 to 8+
            feedback: 0.2,      // 0 to 1+
            delay: 0.0045,      // 0 to 1
            bypass: 1,          // the value 1 starts the effect as bypassed, 0 or 1
          },
          Delay: {
            feedback: 0.45,    // 0 to 1+
            delayTime: 150,    // 1 to 10000 milliseconds
            wetLevel: 0.25,    // 0 to 1+
            dryLevel: 1,       // 0 to 1+
            cutoff: 2000,      // cutoff frequency of the built in lowpass-filter. 20 to 22050
            bypass: 1,
          },
          Overdrive: {
            outputGain: 0.5,         // 0 to 1+
            drive: 0.7,              // 0 to 1
            curveAmount: 1,          // 0 to 1
            algorithmIndex: 0,       // 0 to 5, selects one of our drive algorithms
            bypass: 1,
          },
          Phaser: {
            rate: 1.2,                     // 0.01 to 8 is a decent rangbut higher values are possible
            depth: 0.3,                    // 0 to 1
            feedback: 0.2,                 // 0 to 1+
            stereoPhase: 30,               // 0 to 180
            baseModulationFrequency: 700,  // 500 to 1500
            bypass: 1,
          },
          Compressor: {
            threshold: -1,     // -100 to 0
            makeupGain: 1,     // 0 and up (in decibels)
            attack: 1,         // 0 to 1000
            release: 0,        // 0 to 3000
            ratio: 4,          // 1 to 20
            knee: 5,           // 0 to 40
            automakeup: 1,  // true/false
            bypass: 1,
          },
          // Convolver: {
          //   highCut: 22050,    // 20 to 22050
          //   lowCut: 20,        // 20 to 22050
          //   dryLevel: 1,       // 0 to 1+
          //   wetLevel: 1,       // 0 to 1+
          //   level: 1,          // 0 to 1+, adjusts total output of both wet and dry
          //   impulse: 'http://localhost:3000/api/v1/impulses?id=BlockInside.wav',
          //   bypass: 1,
          // },
          // Filter: {
          //   frequency: 440,        // :4 to 22050
          //   Q: 1,                  // 0.001 to 100
          //   gain: 0,               // -40 to 40 (in decibels)
          //   filterType: 'lowpass', // lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass 
          //   bypass: 1,
          // // },
          // Cabinet: {
          //   makeupGain: 1,                                 // 0 to 20
          //   impulsePath: 'http://localhost:3000/api/v1/impulses?id=DirectCabinetN1.wav',    // path to your speaker impulse
          //   bypass: 1,
          // },
          Tremolo: {
            intensity: 0.3,    // 0 to 1
            rate: 4,           // 0.001 to 8
            stereoPhase: 0,    // 0 to 180
            bypass: 1,
          },
          WahWah: {
            automode: true,        // true/false
            baseFrequency: 0.5,    // 0 to 1
            excursionOctaves: 2,   // 1 to 6
            sweep: 0.2,            // 0 to 1
            resonance: 10,         // 1 to 100
            sensitivity: 0.5,      // -1 to 1
            bypass: 1,
          },
          Bitcrusher: {
            bits: 4,           // 1 to 16
            normfreq: 0.1,     // 0 to 1
            bufferSize: 4096,  // 256 to 16384
            bypass: 1,
          },
          MoogFilter: {
            cutoff: 0.065,     // 0 to 1
            resonance: 3.5,    // 0 to 4
            bufferSize: 4096,  // 256 to 16384
            bypass: 1,
          },
          PingPongDelay: {
            wetLevel: 0.5,       // 0 to 1
            feedback: 0.3,       // 0 to 1
            delayTimeLeft: 150,  // 1 to 10000 (milliseconds)
            delayTimeRight: 200, // 1 to 10000 (milliseconds)
            bypass: 1,
          },
        },
        oscillators: [],
      },
    }
  }

  round(number, decimals) {
    return +(Math.round(number + 'e+' + decimals) + 'e-' + decimals)
  }

  previewSound = () => {
    this.props.previewSound(this.state.spec)
  }

  stopSound = () => {
    this.props.stopSound()
  }

  stopAllSounds = () => {
    this.props.stopAllSounds()
  }

  updateValue = (key) => ({ target }) => {
    this.setState(update(this.state, { spec: { [key]: { $set: parseFloat(target.value) } } }))
  }

  updatePitch = ({ target }) => {
    const newPitch = target.value.toUpperCase()
    this.setState(update(this.state, { spec: { pitch: { $set: newPitch } } }))
  }

  updateSource = ({ target }) => {
    this.setState(update(this.state, { spec: { source: { $set: target.value } } }))
  }

  updateADSR = (key) => ({ target }) => {
    this.setState(update(this.state, { spec: { env: { [key]: { $set: this.round(target.value, 4) } } } }))
  }

  updateFilter = (key) => ({ target }) => {
    const newValue = key === 'type' ? target.value : this.round(target.value, 4)
    this.setState(update(this.state, { spec: { filter: { [key]: { $set: newValue } } } }))
  }

  updateFilterEnvelope = (key) => ({ target }) => {
    this.setState(update(this.state, { spec: { filter: { env: { [key]: { $set: this.round(target.value, 4) } } } } }))
  }

  updateReverbWet = ({ target }) => {
    const newReverbWet = this.round(target.value, 4)
    this.setState(update(this.state, { spec: { reverb: { wet: { $set: newReverbWet } } } }))
  }

  updateReverbImpulse = ({ target }) => {
    const newReverbImpulseURL = `http://localhost:3000/api/v1/impulses?id=${target.value}.wav`
    this.setState(update(this.state, { spec: { reverb: { impulse: { $set: newReverbImpulseURL } } } }))
  }

  updateShape = (key) => ({ target }) => {
    this.setState(update(this.state, { spec: { [key]: { shape: { $set: target.value } } } }))
  }

  updateVibrato = (key) => ({ target }) => {
    this.setState(update(this.state, { spec: { vibrato: { [key]: { $set: this.round(target.value, 4) } } } }))
  }

  updateTunaBypass = (key) => ({ target }) => {
    this.setState(update(this.state, { spec: { tuna: { [key]: { bypass: { $set: parseInt(target.value, 10) } } } } }))
  }

  updateTuna = (effect, property) => ({ target }) => {
    this.setState(update(this.state, { spec: { tuna: { [effect]: { [property]: { $set: this.round(target.value, 4) } } } } }))
  }

  render() {
    return (
      <div>
        <div className='btn-group'>
          <Button text='Play' handleClick={this.previewSound} />
          <Button text='Stop' handleClick={this.stopSound} />
          <Button text='Stop All' handleClick={this.stopAllSounds} />
        </div>

        <div className='basics'>
          <Select
            name='source-shape'
            className='select source-shape'
            options={['sine', 'sawtooth', 'square', 'triangle']}
            updateSelection={e => this.updateSource(e)}
          />
          <Slider
            label='Volume'
            className='slider volume'
            id='slider-volume'
            min={0}
            max={1}
            step={0.1}
            handleChange={this.updateValue('volume')}
            value={this.state.spec.volume}
          />
          <Slider
            label='Detune'
            className='slider detune'
            id='slider-detune'
            min={0}
            max={1200}
            step={1}
            handleChange={this.updateValue('detune')}
            value={this.state.spec.detune}
          />
          <Slider
            label='Panning'
            className='slider panning'
            id='slider-panning'
            min={-1}
            max={1}
            step={0.01}
            handleChange={this.updateValue('panning')}
            value={this.state.spec.panning}
          />
          <span> Pitch (A0-C8) </span>
          <input name='pitch' placeholder='pitch A0-C8' type='text' value={this.state.spec.pitch} onChange={e => this.updatePitch(e)} />
          <br />
        </div>

        <div className='ADSR'>
          <h4> ADSR </h4>
          <Slider
            label='Attack'
            className='slider adsr-env-attack'
            id='slider-adsr-env-attack'
            min={0}
            max={1}
            step={0.01}
            handleChange={this.updateADSR('attack')}
            value={this.state.spec.env.attack}
          />
          <Slider
            label='Decay'
            className='slider adsr-env-decay'
            id='slider-adsr-env-decay'
            min={0}
            max={5}
            step={0.01}
            handleChange={this.updateADSR('decay')}
            value={this.state.spec.env.decay}
          />
          <Slider
            label='Sustain'
            className='slider adsr-env-sustain'
            id='slider-adsr-env-sustain'
            min={0}
            max={1}
            step={0.01}
            handleChange={this.updateADSR('sustain')}
            value={this.state.spec.env.sustain}
          />
          <Slider
            label='Hold'
            className='slider slider adsr-env-hold'
            id='slider-adsr-env-hold'
            min={0}
            max={10}
            step={0.01}
            handleChange={this.updateADSR('hold')}
            value={this.state.spec.env.hold}
          />
          <Slider
            label='Release'
            className='slider adsr-env-release'
            id='slider-adsr-env-release'
            min={0}
            max={10}
            step={0.01}
            handleChange={this.updateADSR('release')}
            value={this.state.spec.env.release}
          />
        </div>
        <div className='filter'>
          <h4> Filter </h4>
          <Select
            name='filter-type'
            className='select filter-type'
            options={['allpass', 'lowpass', 'highpass', 'bandpass', 'lowshelf', 'peaking', 'notch']}
            updateSelection={this.updateFilter('type')}
          />
          <Slider
            label='Frequency'
            className='slider filter-freq'
            id='slider-filter-freq'
            min={0}
            max={5000}
            step={1}
            handleChange={this.updateFilter('frequency')}
            value={this.state.spec.filter.frequency}
          />
          <Slider
            label='Q-factor'
            className='slider filter-q-factor'
            id='slider-filter-q-factor'
            min={0}
            max={10}
            step={0.01}
            handleChange={this.updateFilter('q')}
            value={this.state.spec.filter.q}
          />
          <Slider
            label='Filter Envelope Frequency'
            className='slider filter-env-frequency'
            id='slider-filter-env-frequency'
            min={0}
            max={5000}
            step={1}
            handleChange={this.updateFilterEnvelope('frequency')}
            value={this.state.spec.filter.env.frequency}
          />
          <Slider
            label='Filter Envelope Attack'
            className='slider filter-env-attack'
            id='slider-filter-env-attack'
            min={0}
            max={10}
            step={0.01}
            handleChange={this.updateFilterEnvelope('attack')}
            value={this.state.spec.filter.env.attack}
          />
        </div>
        <div className='reverb'>
          <h4> Reverb </h4>
          <Select
            name='select-reverb-impulse'
            className='select reverb-impulse'
            options={[
              'BlockInside',
              'BottleHall',
              'CementBlocks1',
              'CementBlocks2',
              'ChateaudeLogneOutside',
              'ConcLongEchoHall',
              'DeepSpace',
              'DerlonSanctuary',
              'DirectCabinetN1',
              'DirectCabinetN2',
              'DirectCabinetN3',
              'DirectCabinetN4',
              'FiveColumns',
              'FiveColunsLong',
              'French18thCenturySalon',
              'GoingHome',
              'Greek7EchoHall',
              'HighlyDampedLargeRoom',
              'InTheSilo',
              'InTheSiloRevised',
              'LargeBottleHall',
              'LargeLongEchoHall',
              'LargeWideEchoHall',
              'MasonicLodge',
              'Musikvereinsaal',
              'NarrowBumpySpace',
              'NiceDrumRoom',
              'OnaStar',
              'ParkingGarage',
              'Rays',
              'RightGlassTable',
              'RubyRoom',
              'ScalaMilanOperaHall',
              'SmallPrehistoricCave',
              'StNicolaesChurch',
              'TrigRoom',
              'VocalDuo',
            ]}
            updateSelection={this.updateReverbImpulse}
          />
          <Slider
            label='Reverb Wet'
            className='slider reverb-wet'
            id='slider-reverb-wet'
            min={0}
            max={1}
            step={0.01}
            handleChange={this.updateReverbWet}
            value={this.state.spec.reverb.wet}
          />
        </div>
        <div className='lfo-container'>
          <h2> LFOs </h2>
          {/* <div className='delay'>
            <h4> Delay </h4>
            <Slider
              label='Delay Time'
              className='slider delay-time'
              id='slider-delay-time'
              min={0}
              max={2}
              step={0.01}
              handleChange={updateDelay('delayTime')}
              value={this.state.spec.delay.delayTime}
            />
            <Slider
              label='Delay Wet'
              className='slider delay-wet'
              id='slider-delay-wet'
              min={0}
              max={1}
              step={0.01}
              handleChange={updateDelay('wet')}
              value={this.state.spec.delay.wet}
            />
            <Slider
              label='Delay Feedback'
              className='slider delay-feedback'
              id='slider-delay-feedback'
              min={0}
              max={1}
              step={0.01}
              handleChange={updateDelay('feedback')}
              value={this.state.spec.delay.feedback}
            />
          </div> */}
          <div className='vibrato'>
            <h4> Vibrato </h4>
            <Select
              name='vibrato-shape'
              className='select vibrato-shape'
              options={['sine', 'sawtooth', 'square', 'triangle']}
              updateSelection={this.updateShape('vibrato')}
            />
            <Slider
              label='Vibrato Magnitude'
              className='slider vibrato-magnitude'
              id='slider-vibrato-magnitude'
              min={1}
              max={10}
              step={0.1}
              handleChange={this.updateVibrato('magnitude')}
              value={this.state.spec.vibrato.magnitude}
            />
            <Slider
              label='Vibrato Speed'
              className='slider vibrato-speed'
              id='slider-vibrato-speed'
              min={0}
              max={10}
              step={0.1}
              handleChange={this.updateVibrato('speed')}
              value={this.state.spec.vibrato.speed}
            />
            <Slider
              label='Vibrato Attack'
              className='slider vibrato-attack'
              id='slider-vibrato-attack'
              min={0}
              max={10}
              step={0.1}
              handleChange={this.updateVibrato('attack')}
              value={this.state.spec.vibrato.attack}
            />
          </div>
          {/* <div className='tremolo'>
            <h4> Tremolo </h4>
            <Select
              name='tremolo-shape'
              className='select tremolo-shape'
              options={['sine', 'sawtooth', 'square', 'triangle']}
              updateSelection={this.updateShape('tremolo')}
            />
            <Slider
              label='Tremolo Magnitude'
              className='slider tremolo-magnitude'
              id='slider-tremolo-magnitude'
              min={1}
              max={10}
              step={0.1}
              handleChange={this.updateTremolo('magnitude')}
              value={this.state.spec.tremolo.magnitude}
            />
            <Slider
              label='Tremolo Speed'
              className='slider tremolo-speed'
              id='slider-tremolo-speed'
              min={0}
              max={10}
              step={0.1}
              handleChange={this.updateTremolo('speed')}
              value={this.state.spec.tremolo.speed}
            />
            <Slider
              label='Tremolo Attack'
              className='slider tremolo-attack'
              id='slider-tremolo-attack'
              min={0}
              max={10}
              step={0.1}
              handleChange={this.updateTremolo('attack')}
              value={this.state.spec.tremolo.attack}
            />
          </div>*/}
        </div>
          <div className='tuna'>
            <h2>Tuna</h2>
            <div className='tuna-chorus'>
              <h4> Chorus </h4>
              <Slider
                label='Rate'
                className='slider tuna-chorus-rate'
                id='slider-tuna-chorus-rate'
                min={0}
                max={8}
                step={0.1}
                handleChange={this.updateTuna('Chorus', 'rate')}
                value={this.state.spec.tuna.Chorus.rate}
              />
              <Slider
                label='Feedback'
                className='slider tuna-chorus-feedback'
                id='slider-tuna-chorus-feedback'
                min={0}
                max={1}
                step={0.01}
                handleChange={this.updateTuna('Chorus', 'feedback')}
                value={this.state.spec.tuna.Chorus.feedback}
              />
              <Slider
                label='Delay'
                className='slider tuna-chorus-delay'
                id='slider-tuna-chorus-delay'
                min={0}
                max={1}
                step={0.01}
                handleChange={this.updateTuna('Chorus', 'delay')}
                value={this.state.spec.tuna.Chorus.delay}
              />
              <Slider
                label='Bypass'
                className='slider tuna-chorus-bypass'
                id='slider-tuna-chorus-bypass'
                min={0}
                max={1}
                step={1}
                handleChange={this.updateTunaBypass('Chorus')}
                value={this.state.spec.tuna.Chorus.bypass}
              />
            </div>
            <div className='tuna-delay'>
              <h4> Delay </h4>
              <Slider
                label='Feedback'
                className='slider tuna-delay-feedback'
                id='slider-tuna-tuna-delay-feedback'
                min={0}
                max={1}
                step={0.10}
                handleChange={this.updateTuna('Delay', 'feedback')}
                value={this.state.spec.tuna.Delay.feedback}
              />
              <Slider
                label='Delay Time'
                className='slider tuna-delay-delay-time'
                id='slider-tuna-tuna-delay-delay-time'
                min={1}
                max={10000}
                step={1}
                handleChange={this.updateTuna('Delay', 'delayTime')}
                value={this.state.spec.tuna.Delay.delayTime}
              />
              <Slider
                label='Wet Level'
                className='slider tuna-delay-wet-level'
                id='slider-tuna-tuna-delay-wet-level'
                min={0}
                max={1}
                step={0.10}
                handleChange={this.updateTuna('Delay', 'wetLevel')}
                value={this.state.spec.tuna.Delay.wetLevel}
              />
              <Slider
                label='Dry Level'
                className='slider tuna-delay-dry-level'
                id='slider-tuna-tuna-delay-dry-level'
                min={0}
                max={1}
                step={0.10}
                handleChange={this.updateTuna('Delay', 'dryLevel')}
                value={this.state.spec.tuna.Delay.dryLevel}
              />
              <Slider
                label='Cutoff'
                className='slider tuna-delay-cutoff'
                id='slider-tuna-tuna-delay-cutoff'
                min={20}
                max={22050}
                step={1}
                handleChange={this.updateTuna('Delay', 'cutoff')}
                value={this.state.spec.tuna.Delay.cutoff}
              />
              <Slider
                label='Bypass'
                className='slider tuna-delay-bypass'
                id='slider-tuna-delay-bypass'
                min={0}
                max={1}
                step={1}
                handleChange={this.updateTunaBypass('Delay')}
                value={this.state.spec.tuna.Delay.bypass}
              />
            </div>
            <div className='tuna-phaser'>
              <h4> Phaser </h4>
              <Slider
                label='Rate'
                className='slider tuna-phaser-rate'
                id='slider-tuna-phaser-rate'
                min={0.1}
                max={8}
                step={0.1}
                handleChange={this.updateTuna('Phaser', 'rate')}
                value={this.state.spec.tuna.Phaser.rate}
              />
              <Slider
                label='Depth'
                className='slider tuna-phaser-depth'
                id='slider-tuna-phaser-depth'
                min={0}
                max={1}
                step={0.1}
                handleChange={this.updateTuna('Phaser', 'depth')}
                value={this.state.spec.tuna.Phaser.depth}
              />
              <Slider
                label='Feedback'
                className='slider tuna-phaser-feedback'
                id='slider-tuna-phaser-feedback'
                min={0}
                max={1}
                step={0.01}
                handleChange={this.updateTuna('Phaser', 'feedback')}
                value={this.state.spec.tuna.Phaser.feedback}
              />
              <Slider
                label='stereoPhase'
                className='slider tuna-phaser-stereo-phase'
                id='slider-tuna-phaser-stereo-phase'
                min={0}
                max={180}
                step={1}
                handleChange={this.updateTuna('Phaser', 'stereoPhase')}
                value={this.state.spec.tuna.Phaser.stereoPhase}
              />
              <Slider
                label='baseModulationFrequency'
                className='slider tuna-phaser-base-modulation-frequency'
                id='slider-tuna-phaser-base-modulation-frequency'
                min={500}
                max={1500}
                step={1}
                handleChange={this.updateTuna('Phaser', 'baseModulationFrequency')}
                value={this.state.spec.tuna.Phaser.baseModulationFrequency}
              />
              <Slider
                label='Bypass'
                className='slider tuna-phaser-bypass'
                id='slider-tuna-phaser-bypass'
                min={0}
                max={1}
                step={1}
                handleChange={this.updateTunaBypass('Phaser')}
                value={this.state.spec.tuna.Phaser.bypass}
              />
            </div>
            <div className='tuna-overdrive'>
              <h4> Overdrive </h4>
              <Slider
                label='Output Gain'
                className='slider tuna-overdrive-output-gain'
                id='slider-tuna-overdrive-output-gain'
                min={0}
                max={1}
                step={0.01}
                handleChange={this.updateTuna('Overdrive', 'outputGain')}
                value={this.state.spec.tuna.Overdrive.outputGain}
              />
              <Slider
                label='Drive'
                className='slider tuna-overdrive-drive'
                id='slider-tuna-overdrive-drive'
                min={0}
                max={1}
                step={0.01}
                handleChange={this.updateTuna('Overdrive', 'drive')}
                value={this.state.spec.tuna.Overdrive.drive}
              />
              <Slider
                label='Curve Amount'
                className='slider tuna-overdrive-curve-amount'
                id='slider-tuna-overdrive-curve-amount'
                min={0}
                max={1}
                step={0.01}
                handleChange={this.updateTuna('Overdrive', 'curveAmount')}
                value={this.state.spec.tuna.Overdrive.curveAmount}
              />
              <Slider
                label='Algorithm Index'
                className='slider tuna-overdrive-algorithm-index'
                id='slider-tuna-overdrive-algorithm-index'
                min={0}
                max={5}
                step={1}
                handleChange={this.updateTuna('Overdrive', 'algorithmIndex')}
                value={this.state.spec.tuna.Overdrive.algorithmIndex}
              />
              <Slider
                label='Bypass'
                className='slider tuna-overdrive-bypass'
                id='slider-tuna-overdrive-bypass'
                min={0}
                max={1}
                step={1}
                handleChange={this.updateTunaBypass('Overdrive')}
                value={this.state.spec.tuna.Overdrive.bypass}
              />
            </div>
            <div className='tuna-compressor'>
              <h4> Compressor </h4>
              <Slider
                label='Threshold'
                className='slider tuna-compressor-threshold'
                id='slider-tuna-compressor-threshold'
                min={-100}
                max={0}
                step={1}
                handleChange={this.updateTuna('Compressor', 'threshold')}
                value={this.state.spec.tuna.Compressor.threshold}
              />
              <Slider
                label='Makeup Gain'
                className='slider tuna-compressor-makeup-gain'
                id='slider-tuna-compressor-makeup-gain'
                min={0}
                max={10}
                step={1}
                handleChange={this.updateTuna('Compressor', 'makeupGain')}
                value={this.state.spec.tuna.Compressor.makeupGain}
              />
              <Slider
                label='Attack'
                className='slider tuna-compressor-attack'
                id='slider-tuna-compressor-attack'
                min={0}
                max={1000}
                step={1}
                handleChange={this.updateTuna('Compressor', 'attack')}
                value={this.state.spec.tuna.Compressor.attack}
              />
              <Slider
                label='Release'
                className='slider tuna-compressor-release'
                id='slider-tuna-compressor-release'
                min={0}
                max={10}
                step={1}
                handleChange={this.updateTuna('Compressor', 'release')}
                value={this.state.spec.tuna.Compressor.release}
              />
              <Slider
                label='ratio'
                className='slider tuna-compressor-ratio'
                id='slider-tuna-compressor-ratio'
                min={1}
                max={20}
                step={1}
                handleChange={this.updateTuna('Compressor', 'ratio')}
                value={this.state.spec.tuna.Compressor.ratio}
              />
              <Slider
                label='knee'
                className='slider tuna-compressor-knee'
                id='slider-tuna-compressor-knee'
                min={0}
                max={40}
                step={1}
                handleChange={this.updateTuna('Compressor', 'knee')}
                value={this.state.spec.tuna.Compressor.knee}
              />
              <Slider
                label='automakeup'
                className='slider tuna-compressor-automakeup'
                id='slider-tuna-compressor-automakeup'
                min={0}
                max={1}
                step={1}
                handleChange={this.updateTuna('Compressor', 'automakeup')}
                value={this.state.spec.tuna.Compressor.automakeup}
              />
              <Slider
                label='Bypass'
                className='slider tuna-compressor-bypass'
                id='slider-tuna-compressor-bypass'
                min={0}
                max={1}
                step={1}
                handleChange={this.updateTunaBypass('Compressor')}
                value={this.state.spec.tuna.Compressor.bypass}
              />
            </div>
            {/* <div className='tuna-convolver'>
              <h4> Convolver </h4>
              <Select
                name='select-reverb-impulse'
                className='select reverb-impulse'
                options={[
                  'BlockInside',
                  'BottleHall',
                  'CementBlocks1',
                  'CementBlocks2',
                  'ChateaudeLogneOutside',
                  'ConcLongEchoHall',
                  'DeepSpace',
                  'DerlonSanctuary',
                  'DirectCabinetN1',
                  'DirectCabinetN2',
                  'DirectCabinetN3',
                  'DirectCabinetN4',
                  'FiveColumns',
                  'FiveColunsLong',
                  'French18thCenturySalon',
                  'GoingHome',
                  'Greek7EchoHall',
                  'HighlyDampedLargeRoom',
                  'InTheSilo',
                  'InTheSiloRevised',
                  'LargeBottleHall',
                  'LargeLongEchoHall',
                  'LargeWideEchoHall',
                  'MasonicLodge',
                  'Musikvereinsaal',
                  'NarrowBumpySpace',
                  'NiceDrumRoom',
                  'OnaStar',
                  'ParkingGarage',
                  'Rays',
                  'RightGlassTable',
                  'RubyRoom',
                  'ScalaMilanOperaHall',
                  'SmallPrehistoricCave',
                  'StNicolaesChurch',
                  'TrigRoom',
                  'VocalDuo',
                ]}
                updateSelection={this.updateTunaConvolverImpulse(e)}
              />
              <Slider
                label='highCut'
                className='slider tuna-convolver-highCut'
                id='slider-tuna-convolver-highCut'
                min={20}
                max={22050}
                step={1}
                handleChange={this.updateTuna('Convolver', 'highCut')}
                value={this.state.spec.tuna.Convolver.highCut}
              />
              <Slider
                label='lowCut'
                className='slider tuna-convolver-low-cut'
                id='slider-tuna-convolver-low-cut'
                min={20}
                max={22050}
                step={1}
                handleChange={this.updateTuna('Convolver', 'lowCut')}
                value={this.state.spec.tuna.Convolver.lowCut}
              />
              <Slider
                label='dryLevel'
                className='slider tuna-convolver-dry-level'
                id='slider-tuna-convolver-dry-level'
                min={0}
                max={2}
                step={0.01}
                handleChange={this.updateTuna('Convolver', 'dryLevel')}
                value={this.state.spec.tuna.Convolver.dryLevel}
              />
              <Slider
                label='wetLevel'
                className='slider tuna-convolver-wet-level'
                id='slider-tuna-convolver-wet-level'
                min={0}
                max={2}
                step={0.01}
                handleChange={this.updateTuna('Convolver', 'wetLevel')}
                value={this.state.spec.tuna.Convolver.wetLevel}
              />
              <Slider
                label='level'
                className='slider tuna-convolver-level'
                id='slider-tuna-convolver-level'
                min={0}
                max={2}
                step={0.01}
                handleChange={this.updateTuna('Convolver', 'level')}
                value={this.state.spec.tuna.Convolver.level}
              />
              <Slider
                label='Bypass'
                className='slider tuna-convolver-bypass'
                id='slider-tuna-convolver-bypass'
                min={0}
                max={1}
                step={1}
                handleChange={this.updateTunaBypass('Convolver')}
                value={this.state.spec.tuna.Convolver.bypass}
              />
            </div>
            <div className='tuna-filter'>
              <h4> Filter </h4>
              <Slider
                label='Bypass'
                className='slider tuna-filter-bypass'
                id='slider-tuna-filter-bypass'
                min={0}
                max={1}
                step={1}
                handleChange={this.updateTunaBypass('Filter')}
                value={this.state.spec.tuna.Filter.bypass}
              />
            </div>
            <div classNme='tuna-cabinet'>
              <h4> Cabinet </h4>
              <Slider
                label='Bypass'
                className='slider tuna-cabinet-bypass'
                id='slider-tuna-cabinet-bypass'
                min={0}
                max={1}
                step={1}
                handleChange={this.updateTunaBypass('Cabinet')}
                value={this.state.spec.tuna.Cabinet.bypass}
              />
            </div>
            */}
            <div className='tuna-tremolo'>
              <h4> Tremolo </h4>
              <Slider
                label='Bypass'
                className='slider tuna-tremolo-bypass'
                id='slider-tuna-tremolo-bypass'
                min={0}
                max={1}
                step={1}
                handleChange={this.updateTunaBypass('Tremolo')}
                value={this.state.spec.tuna.Tremolo.bypass}
              />
            </div>
            <div className='tuna-wahah'>
              <h4> WahWah </h4>
              <Slider
                label='Bypass'
                className='slider tuna-wahwah-bypass'
                id='slider-tuna-wahwah-bypass'
                min={0}
                max={1}
                step={1}
                handleChange={this.updateTunaBypass('WahWah')}
                value={this.state.spec.tuna.WahWah.bypass}
              />
            </div>
            <div className='tuna-bitcrusher'>
              <h4> Bitcrusher </h4>
              <Slider
                label='Bypass'
                className='slider tuna-bitcrusher-bypass'
                id='slider-tuna-bitcrusher-bypass'
                min={0}
                max={1}
                step={1}
                handleChange={this.updateTunaBypass('Bitcrusher')}
                value={this.state.spec.tuna.Bitcrusher.bypass}
              />
            </div>
            <div className='tuna-moog-filter'>
              <h4> Moog Filter </h4>
              <Slider
                label='Bypass'
                className='slider tuna-moog-filter-bypass'
                id='slider-tuna-moog-filter-bypass'
                min={0}
                max={1}
                step={1}
                handleChange={this.updateTunaBypass('MoogFilter')}
                value={this.state.spec.tuna.MoogFilter.bypass}
              />
            </div>
            <div className='tuna-ping-pong-delay'>
              <h4> PingPong Delay </h4>
              <Slider
                label='Bypass'
                className='slider tuna-ping-pong-delay-bypass'
                id='slider-tuna-ping-pong-delay-bypass'
                min={0}
                max={1}
                step={1}
                handleChange={this.updateTunaBypass('PingPongDelay')}
                value={this.state.spec.tuna.PingPongDelay.bypass}
              />
            </div>
          </div>
      </div>
    )
  }
}

export default SoundMaker
