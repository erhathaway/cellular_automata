import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import stylePropType from 'react-style-proptype';

import Popup from './Popup';

class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shouldShowPopup: false,
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


  setExclusionCoords(coords) {
    this.setState(state => ({ ...state, exclusionCoords: coords }));
  }

  calcParentCoords() {
    const coords = ReactDOM // eslint-disable-line react/no-find-dom-node
      .findDOMNode(this.myRef.current)
      .getBoundingClientRect();
    this.setState(state => ({ ...state, parentCoords: coords }));
  }

  hidePopup() {
    this.setState(state => ({ ...state, shouldShowPopup: false }));
  }

  showPopup() {
    const { shouldShowPopup } = this.state;

    if (!shouldShowPopup) {
      this.setState(state => ({ ...state, shouldShowPopup: true }));
    }
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
      shouldPositionPopup,
      ...props
    } = this.props;

    const { shouldShowPopup, parentCoords, exclusionCoords: exclusionCoordsFromChild } = this.state;

    const childrenWithProps = React.cloneElement(children, {
      menuPlacement,
      setExclusionCoords: this.setExclusionCoords,
      ...props,
    });

    const popup = React.isValidElement(component)
      ? React.cloneElement(component, { ...childrenWithProps.props, ...props })
      : React.createElement(component, { ...childrenWithProps.props, ...props });

    const orientationStyle = menuPlacement === 'hasDockedTop' ? { height: '100%' } : { width: '100%' };
    const style = propsStyle || { ...orientationStyle, display: 'flex', flexGrow: '1' };

    /* eslint-disable */
    // disabling because event handler doesn't play well with the div, but we need it b/c we can't always get a ref on the child
    return (
      <div onClick={this.showPopup} ref={this.myRef} style={style}>
        <Popup
          /* position of popup relative to parent ex: 'left', 'right', 'top', */
          shouldPosition={shouldPositionPopup}
          /* should show popup. controls animations */
          show={shouldShowPopup}
          /* callback - popup calculates the coordinates of itself and calls this callback with them */
          setPopupCoords={setPopupCoords}
          /* coordinates that count as part of the popup and wont trigger a shouldHide callback call on cursor movement */
          cursorExclusionCoords={exclusionCoordsFromProp || exclusionCoordsFromChild}
          /* coordinates that count as part of the popup and wont trigger a shouldHide callback call on clicks movement */
          clickExclusionCoords={exclusionCoordsFromProp || exclusionCoordsFromChild}
          /* parent coords - used to position popup */
          parentCoords={parentCoords}
          /* name of popup - used for meaningful identity in the DOM */
          popupName={popupName}
          /* callback triggered when the popup thinks it should hide
            - defaults:
                cursor movement: when outside itself AND its parent
                clicks: when outside itself
          */
          shouldHide={this.hidePopup}
        >
          { popup }
        </Popup>
        { childrenWithProps }
      </div>
    );
    /* eslint-enable */
  }
}

Component.propTypes = {
  children: PropTypes.element.isRequired,
  component: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
    PropTypes.element,
  ]).isRequired,
  exclusionCoords: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    height: PropTypes.number,
    width: PropTypes.number,
  }),
  setPopupCoords: PropTypes.func,
  popupName: PropTypes.string,
  menuPlacement: PropTypes.string,
  style: stylePropType,
};

Component.defaultProps = {
  exclusionCoords: undefined, // default as undefined so it can be overriden if set via instance method passed to child
  setPopupCoords: undefined,
  popupName: undefined,
  menuPlacement: undefined,
  style: undefined,
};


export default Component;
