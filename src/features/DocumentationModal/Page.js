import React from 'react';
import styled from 'react-emotion';
import ReactMarkdown from 'react-markdown';
import anime from 'animejs';

import './markdownStyle.css';

const Container = styled('div')`
  position: relative;
  height: 100%;
  width: 100%;
  color: white;
  background-color: inherit;
  margin-top: 200px;
  margin-bottom: 100px;
  z-index: 1;
  overflow-x: hidden;
  opacity: 0;
`;


export default class Component extends React.Component {
  static animateIn() {
    anime({
      targets: '.markdown-container',
      left: [20, 0],
      opacity: [0, 1],
      duration: 500,
      elasticity: 1500,
      easing: 'easeOutQuint',
      delay: 500,
    });
  }

  // static animateOut() {
  //   anime({
  //     targets: '.markdown-container',
  //     translateX: [2000, 0],
  //     opacity: [1, 0],
  //     duration: 1500,
  //     elasticity: 500,
  //     easing: 'easeOutQuint',
  //     delay: 0,
  //   });
  // }

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
    window.scrollTo(0, 0);
  }

  // componentWillUpdate({ inState }) {
  //   if (inState === 'exiting') { Component.animateOut(); }
  // }


  render() {
    const { text } = this.state;

    return (
      <Container className="markdown-container">
        <ReactMarkdown className="doc" source={text} />
      </Container>
    );
  }
}
