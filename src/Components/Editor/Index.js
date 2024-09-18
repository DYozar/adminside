"use client"
import React, { Component } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageUploader from 'quill2-image-uploader';

// Register the ImageUploader module with Quill
Quill.register('modules/imageUploader', ImageUploader);

class QuillEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: this.props.value || ''
    };
  }

  modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video', 'formula'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ],
    imageUploader: {
      upload: (file) => {
        return new Promise((resolve, reject) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'ml_default');
          
          fetch('https://api.cloudinary.com/v1_1/dslidimik/image/upload', {
            method: 'POST',
            body: formData,
          })
            .then(response => response.json())
            .then(result => {
              if (result.secure_url) {
                resolve(result.secure_url);
              } else {
                reject('Upload failed');
              }
            })
            .catch(error => {
              reject('Upload failed');
              console.error('Error:', error);
            });
        });
      }
    }
  };

  formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'color', 'background',
    'script', 'sub', 'super',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'link', 'image', 'video', 'formula',
  ];

  handleChange = (content) => {
    this.setState({ text: content });
    this.props.onChange && this.props.onChange(content);
  }

  render() {
    return (
      <div className="quill-container">
        <ReactQuill
          value={this.state.text}
          onChange={this.handleChange}
          theme="snow"
          modules={this.modules}
          formats={this.formats}
        />
      </div>
    );
  }
}

export default QuillEditor;
