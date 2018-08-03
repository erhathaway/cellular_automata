import React from 'react';
import ReactMarkdown from 'react-markdown';
import './markdownStyle.css';


class Doc extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      text: '',
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

  render() {
    const { text } = this.state;
    return <ReactMarkdown className="markdown" source={this.state.text} />
  }
}

export default Doc;
