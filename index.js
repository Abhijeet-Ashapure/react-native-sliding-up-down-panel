import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
const { width, height } = Dimensions.get('window');
let sliderPosition = 0;


function headerViewPanelPositionStyle(panelPosition, heightAnim, widthtAnim) {
  let style = {};
  if(panelPosition === 'bottom') {
    style = {bottom: heightAnim, flex: 1, position: 'absolute',}
  }
  if(panelPosition === 'top') {
    style = {top: heightAnim, flex: 1, position: 'absolute',}
  }
  if(panelPosition === 'right') {
    style = {right: widthtAnim, flex: 1, position: 'absolute',}
  }
  if(panelPosition === 'left') {
    style = {left: widthtAnim, flex: 1, position: 'absolute',}
  }
  return style
}

function slidingPanelViewPositionStyle(panelPosition, headerPanelHeight, headerPanelWidth) {
  let style = {};
  if(panelPosition === 'bottom') {
    style = {top: headerPanelHeight, left: 0, position: 'absolute'}
  }
  if(panelPosition === 'top') {
    style = {bottom: headerPanelHeight, left: 0, position: 'absolute'}
  }
  if(panelPosition === 'right') {
    style = {left: headerPanelWidth, top: 0, position: 'absolute'}
  }
  if(panelPosition === 'left') {
    style = {right: headerPanelWidth, top: 0, position: 'absolute'}
  }
  return style;
}

function isSlidingVertically(panelPosition){
  if(panelPosition === 'left' || panelPosition === 'right')
    return true
  else
    return false
}

const HeaderView = (props) => (
  <View style={{backgroundColor: 'green',}}><Text style={{color: 'white'}}>Hello world</Text></View>
)

const SlidingPanelView = (props) => (
  <View style={{height: 200, width, backgroundColor: 'blue'}}><Text style={{color: 'white'}}>Hello world</Text></View>
)

const SlidingPanelIOS = (props) => (
  <Animated.View style={headerViewPanelPositionStyle(props.panelPosition, props.heightAnim, props.widthtAnim)}>
    <Animated.View
      {...props.panResponder} 
      style={ props.headerPanelHeight ? {height: props.headerPanelHeight} : {width: props.headerPanelWidth}} 
    >   
      {props.headerView()}
    </Animated.View>
    <View style={slidingPanelViewPositionStyle(props.panelPosition, props.headerPanelHeight, props.headerPanelWidth)}>
      {props.slidingPanelView()}
    </View>
  </Animated.View>
);

const SlidingPanelAndroid = (props) => (
    <Animated.View style={headerViewPanelPositionStyle(props.panelPosition, props.heightAnim, props.widthtAnim)}>
    <Animated.View
      {...props.panResponder} 
      style={ props.headerPanelHeight ? {height: props.headerPanelHeight} : {width: props.headerPanelWidth}}
    >   
      {props.headerView()}
    </Animated.View>
    <Animated.View style={slidingPanelViewPositionStyle(props.panelPosition, props.headerPanelHeight, props.headerPanelWidth)}>
      {props.slidingPanelView()}
    </Animated.View>
  </Animated.View>
);

export default class SlidingPanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      heightAnim: new Animated.Value(0),
      widthtAnim: new Animated.Value(0),
      panResponder: {},
    };
  }

  componentWillMount() {
    var a = 0;
    let panResponder = PanResponder.create({
      onStartShouldSetPanResponder : () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        a = 0;
      },
      onPanResponderMove : (event, gestureState) => {
        if(this.props.allowDragging) {
          if(a === 0) {
            this.props.onDragStart(event, gestureState);
          }
          else {
            this.props.onDrag(event, gestureState);
          }
          if(this.props.panelPosition === 'bottom') {
            a = gestureState.dy * -1;
          }
          if(this.props.panelPosition === 'top') {
            a = gestureState.dy * 1;
          }
          if(this.props.panelPosition === 'right') {
            a = gestureState.dx * -1;
          }
          if(this.props.panelPosition === 'left') {
            a = gestureState.dx * 1;
          }

          let check = {}
          if(Platform.OS === 'android'){
            if(!isSlidingVertically(this.props.panelPosition)) {
              if(this.props.slidingPanelLayoutHeight)
                check = sliderPosition + a < this.props.slidingPanelLayoutHeight
              else
                check = sliderPosition + a < height - (this.props.headerLayoutHeight + 25)
            } else {
              if(this.props.slidingPanelLayoutWidth)
                check = sliderPosition + a < this.props.slidingPanelLayoutWidth
              else
                check = sliderPosition + a < width - (this.props.headerLayoutWidth + 25)
            }
            
          }else{
            if(this.props.slidingPanelLayoutHeight) {
              if(this.props.slidingPanelLayoutHeight)
                check = sliderPosition + a < this.props.slidingPanelLayoutHeight
              else
                check =  sliderPosition + a <  height - (this.props.headerLayoutHeight -2)   
            } else {
              if(this.props.slidingPanelLayoutWidth)
                check = sliderPosition + a < this.props.slidingPanelLayoutWidth
              else
                check =  sliderPosition + a <  width - (this.props.headerLayoutWidth -2)  
            }
          }

          if(check && sliderPosition + a > -2){
            if(sliderPosition !== 0) {
              if(!isSlidingVertically(this.props.panelPosition))
                this.state.widthtAnim.setValue(sliderPosition + a)
              else
                this.state.heightAnim.setValue(sliderPosition + a)
            }
            else {
              if(!isSlidingVertically(this.props.panelPosition))
                this.state.widthtAnim.setValue(a)
              else
                this.state.heightAnim.setValue(a)
              
            }
          }
        }
      },
      onPanResponderRelease : (e, gesture) => {
        sliderPosition = sliderPosition + a
        if(a !== 0) {
          this.props.onDragStop(e, gesture)
        }
        
        if(this.props.allowAnimation) {
          let gestureVelocity = {}
          if(this.props.panelPosition === 'bottom')
            gestureVelocity = gesture.vy < -1
          if(this.props.panelPosition === 'top')
            gestureVelocity = gesture.vy > 1
          if(this.props.panelPosition === 'right')
            gestureVelocity = gesture.vx < -1
          if(this.props.panelPosition === 'left')
            gestureVelocity = gesture.vx > 1

          if(a === 0 || gestureVelocity) {
            let currentSliderPosition = {}
            if (!isSlidingVertically(this.props.panelPosition)) {
              if(this.props.slidingPanelLayoutHeight){
              currentSliderPosition = this.props.slidingPanelLayoutHeight
              }else{
                currentSliderPosition = height-this.props.headerLayoutHeight
              }
            } else {
              if(this.props.slidingPanelLayoutWidth){
              currentSliderPosition = this.props.slidingPanelLayoutWidth
              }else{
                currentSliderPosition = width-this.props.headerLayoutWidth
              }
            }

            if(sliderPosition < currentSliderPosition) {
              sliderPosition = currentSliderPosition
              this.props.onAnimationStart();
              if(!isSlidingVertically(this.props.panelPosition)) {
                Animated.timing(
                  this.state.heightAnim,
                  {
                    toValue: Platform.OS === 'android' ? ( this.props.slidingPanelLayoutHeight ? this.props.slidingPanelLayoutHeight : height-this.props.headerLayoutHeight) : (this.props.slidingPanelLayoutHeight ? this.props.slidingPanelLayoutHeight : height-this.props.headerLayoutHeight),
                    duration: this.props.AnimationSpeed,
                  }
                ).start(() => this.props.onAnimationStop());
              }else{
                Animated.timing(
                  this.state.widthtAnim,
                  {
                    toValue: Platform.OS === 'android' ? ( this.props.slidingPanelLayoutWidth ? this.props.slidingPanelLayoutWidth : width-this.props.headerLayoutWidth) : (this.props.slidingPanelLayoutWidth ? this.props.slidingPanelLayoutWidth : width-this.props.headerLayoutWidth),
                    duration: this.props.AnimationSpeed,
                  }
                ).start(() => this.props.onAnimationStop());
              }
            }
            else {
              sliderPosition = 0
              this.props.onAnimationStart();
              if(!isSlidingVertically(this.props.panelPosition)) {
                Animated.timing(
                  this.state.heightAnim,
                  {
                    toValue: 0,
                    duration: this.props.AnimationSpeed,
                  }
                ).start(() => this.props.onAnimationStop()); 
              }else{
                Animated.timing(
                  this.state.widthtAnim,
                  {
                    toValue: 0,
                    duration: this.props.AnimationSpeed,
                  }
                ).start(() => this.props.onAnimationStop()); 
              }
            }
          }

          let gestureVy = {}
          if(this.props.panelPosition === 'bottom')
            gestureVy = gesture.vy > 1
          if(this.props.panelPosition === 'top')
            gestureVy = gesture.vy < -1
          if(this.props.panelPosition === 'right')
            gestureVy = gesture.vx > 1
          if(this.props.panelPosition === 'left')
            gestureVy = gesture.vx < -1

          if(gestureVy) {
            sliderPosition = 0
            this.props.onAnimationStart();
            if (!isSlidingVertically(this.props.panelPosition)) {
              Animated.timing(
                this.state.heightAnim,
                {
                  toValue: 0,
                  duration: this.props.AnimationSpeed,
                }
              ).start(() => this.props.onAnimationStop());
            } else {
              Animated.timing(
                this.state.widthtAnim,
                {
                  toValue: 0,
                  duration: this.props.AnimationSpeed,
                }
              ).start(() => this.props.onAnimationStop());
            }
          }
        }
      },
    });
    this.setState({panResponder})
  }

  onRequestClose() {
    sliderPosition = 0
    this.props.onAnimationStart();
    if(!isSlidingVertically(this.props.panelPosition))
    {
      Animated.timing(
        this.state.heightAnim,
        {
          toValue: 0,
          duration: this.props.AnimationSpeed,
        }
      ).start(() => this.props.onAnimationStop());
    } else {
      Animated.timing(
        this.state.widthtAnim,
        {
          toValue: 0,
          duration: this.props.AnimationSpeed,
        }
      ).start(() => this.props.onAnimationStop());
    }
  }

  onRequestStart() {
    sliderPosition = {}
    if(!isSlidingVertically(this.props.sliderPosition))
    {
      if(this.props.slidingPanelLayoutHeight){
        sliderPosition = height-this.props.headerLayoutHeight
      }
    } else {
      if(this.props.slidingPanelLayoutWidth){
        sliderPosition = width-this.props.headerLayoutWidth
      }
    }
    this.props.onAnimationStart();
    if(!isSlidingVertically(this.props.panelPosition)){
      Animated.timing(
        this.state.heightAnim,
        {
          toValue: Platform.OS === 'android' ? (this.props.slidingPanelLayoutHeight ? this.props.slidingPanelLayoutHeight : height-this.props.headerLayoutHeight) : (this.props.slidingPanelLayoutHeight ? this.props.slidingPanelLayoutHeight : height-this.props.headerLayoutHeight),
          duration: this.props.AnimationSpeed,
        }
      ).start(() => this.props.onAnimationStop());
    } else {
      Animated.timing(
        this.state.widthtAnim,
        {
          toValue: Platform.OS === 'android' ? (this.props.slidingPanelLayoutWidth ? this.props.slidingPanelLayoutWidth : width-this.props.headerLayoutWidth) : (this.props.slidingPanelLayoutWidth ? this.props.slidingPanelLayoutWidth : height-this.props.headerLayoutWidth),
          duration: this.props.AnimationSpeed,
        }
      ).start(() => this.props.onAnimationStop());
    }
  }

  isOpen(){
    if(sliderPosition > 0){
      return true;
    }else{
      return false;
    }
  }

  render() {
    let containerStyle = {};
    if(this.props.panelPosition === 'bottom') {
      containerStyle = {position: 'absolute', bottom: 0};
    }
    if(this.props.panelPosition === 'top') {
      containerStyle = {position: 'absolute', top: 0};
    }
    if(this.props.panelPosition === 'right') {
      containerStyle = {position: 'absolute', right: 0};
    }
    if(this.props.panelPosition === 'left') {
      containerStyle = {position: 'absolute', left: 0};
    }
    return (
      <View style={containerStyle}>
        {
          Platform.OS === 'ios' && this.props.visible === true ?
            <SlidingPanelIOS
                panResponder = {this.state.panResponder.panHandlers}
                panelPosition={this.props.panelPosition}
                headerPanelHeight={this.props.headerLayoutHeight}
                headerPanelWidth={this.props.headerLayoutWidth}
                headerView = {() => this.props.headerLayout()}
                heightAnim={this.state.heightAnim}
                widthtAnim={this.state.widthtAnim}
                visible={this.props.visible}
                slidingPanelView={() => this.props.slidingPanelLayout()}
            /> : this.props.visible === true &&
            <SlidingPanelAndroid
                panResponder = {this.state.panResponder.panHandlers}
                panelPosition={this.props.panelPosition}
                headerPanelHeight={this.props.headerLayoutHeight}
                headerPanelWidth={this.props.headerLayoutWidth}
                headerView = {() => this.props.headerLayout()}
                heightAnim={this.state.heightAnim}
                widthtAnim={this.state.widthtAnim}
                visible={this.props.visible}
                slidingPanelView={() => this.props.slidingPanelLayout()}
            />
        }
      </View>
    );
  }
}

SlidingPanel.propTypes = {
  headerLayoutHeight: PropTypes.number.isRequired,
  slidingPanelLayoutHeight: PropTypes.number,

  headerLayoutWidth: PropTypes.number.isRequired,
  slidingPanelLayoutWidth: PropTypes.number,

  headerLayout: PropTypes.func.isRequired,
  slidingPanelLayout: PropTypes.func.isRequired,

  AnimationSpeed: PropTypes.number,
  panelPosition: PropTypes.string,
  visible: PropTypes.bool,
  allowDragging: PropTypes.bool,
  allowAnimation: PropTypes.bool,
  onDragStart: (event, gestureState) => {},
  onDragStop: (event, gestureState) => {},
  onDrag: (event, gestureState) => {},
  onAnimationStart: () => {},
  onAnimationStop: () => {},
};

SlidingPanel.defaultProps = {

  headerLayoutHeight: 50,
  slidingPanelLayoutHeight: 0,

  headerLayoutWidth: 10,
  slidingPanelLayoutWidth: 0,

  headerLayout: () => {},
  slidingPanelLayout: () => {},

  panelPosition: 'bottom',
  visible: true,
  onDragStart: (event, gestureState) => {},
  onDragStop: (event, gestureState) => {},
  onDrag: (event, gestureState) => {},
  onAnimationStart: () => {},
  onAnimationStop: () => {},
  allowDragging: true,
  allowAnimation: true,
  AnimationSpeed: 1000,
};
