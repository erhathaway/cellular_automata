import React from 'react';
import ReactDOM from 'react-dom';

import Popup from './Popup';

export default class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shouldShowItemMenu: false,
      parentCoords: {},
      exclusionCoords: {},
    };

    this.myRef = React.createRef();

    this.showPopup = this.showPopup.bind(this);
    this.hidePopup = this.hidePopup.bind(this);
    this.setExclusionCoords = this.setExclusionCoords.bind(this);
  }

  componentDidMount() {
    this.calcParentCoords();
  }

  componentDidUpdate(_, { parentCoords: prevParentCoords }) {
    const { parentCoords: currentParentCoords } = this.state;
    if (prevParentCoords === currentParentCoords) {
      this.calcParentCoords();
    }
  }

  showPopup() {
    const { shouldShowItemMenu } = this.state;

    if (!shouldShowItemMenu) {
      this.setState(state => ({ ...state, shouldShowItemMenu: true }));
    }
  }

  hidePopup() {
    this.setState(state => ({ ...state, shouldShowItemMenu: false }));
  }

  calcParentCoords() {
    const coords = ReactDOM
      .findDOMNode(this.myRef.current)
      .getBoundingClientRect();
    this.setState(state => ({ ...state, parentCoords: coords }));
  }

  setExclusionCoords(coords) {
    this.setState(state => ({ ...state, exclusionCoords: coords }));
  }


  render() {
    const {
      children,
      component,
      popupName,
      menuPlacement,
      style: propsStyle,
      setPopupCoords,
      exclusionCoords: exclusionCoordsFromProp,
      ...props,
    } = this.props;

    const { shouldShowItemMenu, parentCoords, exclusionCoords: exclusionCoordsFromChild } = this.state;

    const childrenWithProps = React.cloneElement(children, {
      menuPlacement,
      setExclusionCoords: this.setExclusionCoords,
      ...props,
    });

    const popup = React.isValidElement(component)
      ? React.cloneElement(component,  { ...childrenWithProps.props, ...props })
      : React.createElement(component, { ...childrenWithProps.props, ...props });

    const orientationStyle = menuPlacement === 'hasDockedTop' ? { height: '100%' } : { width: '100%' };
    const style = propsStyle || { ...orientationStyle, display: 'flex', flexGrow: '1' };

    return (
      <div onClick={this.showPopup} ref={this.myRef} style={style}>
        <Popup
          show={shouldShowItemMenu}
          setPopupCoords={setPopupCoords}
          cursorExclusionCoords={exclusionCoordsFromProp || exclusionCoordsFromChild}
          clickExclusionCoords={exclusionCoordsFromProp || exclusionCoordsFromChild}
          parentCoords={parentCoords}
          popupName={popupName}
          shouldHide={this.hidePopup}
        >
          { popup }
        </Popup>
        { childrenWithProps }
      </div>
    );
  }
}
