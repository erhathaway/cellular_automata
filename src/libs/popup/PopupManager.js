import React from 'react';
import ReactDOM from 'react-dom';

import Popup from './Popup';

export default class Component extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shouldShowItemMenu: false,
      parentCoords: {},
    };

    this.myRef = React.createRef();

    this.showItemMenu = this.showItemMenu.bind(this);
    this.hideItemMenu = this.hideItemMenu.bind(this);
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

  showItemMenu() {
    const { shouldShowItemMenu } = this.state;

    if (!shouldShowItemMenu) {
      this.setState(state => ({ ...state, shouldShowItemMenu: true }));
    }
  }

  hideItemMenu() {
    this.setState(state => ({ ...state, shouldShowItemMenu: false }));
  }

  calcParentCoords() {
    const coords = ReactDOM
      .findDOMNode(this.myRef.current)
      .getBoundingClientRect();
    this.setState(state => ({ ...state, parentCoords: coords }));
  }

  render() {
    const { children, component, popupName, menuPlacement, style: propsStyle, ...props } = this.props;

    const { shouldShowItemMenu, parentCoords } = this.state;

    const childrenWithProps = React.cloneElement(children, {
      menuPlacement,
      ...props,
    });

    const popup = React.createElement(component, { ...props });

    const orientationStyle = menuPlacement === 'hasDockedTop' ? { height: '100%' } : { width: '100%' };
    const style = propsStyle || { ...orientationStyle, display: 'flex', flexGrow: '1' };

    return (
      <React.Fragment>
        <Popup show={shouldShowItemMenu} parentCoords={parentCoords} popupName={popupName} shouldHide={this.hideItemMenu} >
          { popup }
        </Popup>
        <div onClick={this.showItemMenu} ref={this.myRef} style={style}>
          { childrenWithProps }
        </div>
      </React.Fragment>
    );
  }
}
