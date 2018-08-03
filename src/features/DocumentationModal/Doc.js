import React from 'react';
import ReactMarkdown from 'react-markdown';
import anime from 'animejs';

import './markdownStyle.css';


export default class Component extends React.Component {
  static animateIn() {
    anime({
      targets: '.markdown',
      translateX: [10, 0],
      opacity: [0, 1],
      duration: 1500,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 300,
    });
  }

  static animateOut() {
    anime({
      targets: '.markdown',

      opacity: [1, 0],
      duration: 500,
      elasticity: 100,
      easing: 'easeOutQuint',
      delay: 400,
    });
  }

  constructor(props) {
    super(props);

    this.state = {
      text: undefined,
    };
  }

  componentWillMount() {
    const { filePath } = this.props;

    fetch(filePath)
      .then(response => response.text())
      .then((text) => {
        this.setState({ text });
      });
  }

  componentDidMount() {
    Component.animateIn();
  }

  componentWillUpdate({ inState, isSelected: willBeSelected }) {
    // // console.log(inState)
    // const { isSelected } = this.props;
    // if (isSelected && !willBeSelected) { Component.animateOut(); }
    if (inState === 'exiting' && !willBeSelected) { Component.animateOut(); }

  }

  componentWillUnmount() {
    // Component.animateOut();
    // console.log('unmounting')
  }

  render() {
    console.log(this.props.isSelected)
    console.log(this.props.inState, "\n ---------------------")
    // console.log('rendering', this.props.filePath);
    const { text } = this.state;
    const { inState, isSelected } = this.props;

    // if (!text) return <div className="markdown" />
    if ((inState === 'exited' || inState === 'entered') && !isSelected) return null;
    return <ReactMarkdown className="markdown" source={text} />
  }
}
