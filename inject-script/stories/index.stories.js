import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import App from '../src/App'

function sendDanmu (msg, key) {
  let data = {
    profileImgSrc: 'https://dnsofx4sf31ab.cloudfront.net/chat-bot-id.jpg',
    message: msg,
    type: 'live',
    username: 'bar'
  }
  window.postMessage({[key]:data}, '*')
}

storiesOf('Realtime danmu', module)
  .add('Test 短中文', () => (
    <div>
      <App/>
      <button onClick={()=>{
        sendDanmu('好', 'msg')
      }}>Send</button>
    </div>
  ))
  .add('Test 长中文', () => (
    <div>
      <App/>
      <button onClick={()=>{
        sendDanmu('《一拳超人》是由ONE原作、村田雄介作画，连载于网络漫画杂志《邻座的Young jump》上的漫画。 [1-2]  原为ONE在个人网站上连载的练笔之作， [3]  后被喜爱该作的另一漫画家村田雄介，在征得ONE同意后重新绘制而成。', 'msg')
      }}>Send</button>
    </div>
  ))
  .add('Test short msg', () => (
    <div>
      <App/>
      <button onClick={()=>{
        sendDanmu('Hello there!', 'msg')
      }}>Send</button>
    </div>
  ))
  .add('Test long msg', () => (
    <div>
      <App/>
      <button onClick={()=>{
        sendDanmu('One-Punch Man (Japanese: ワンパンマン Hepburn: Wanpanman) is an ongoing Japanese superhero webcomic created by ONE which began publication in early 2009. The series quickly went viral, surpassing 7.9 million hits in June 2012.', 'msg')
      }}>Send</button>
    </div>
  ));


  storiesOf('Video danmu', module)
  .add('Test 短中文', () => (
    <div>
      <App/>
      <button onClick={()=>{
        sendDanmu('好', 'canvas')
      }}>Send</button>
    </div>
  ))
  .add('Test 长中文', () => (
    <div>
      <App/>
      <button onClick={()=>{
        sendDanmu('《一拳超人》是由ONE原作、村田雄介作画，连载于网络漫画杂志《邻座的Young jump》上的漫画。 [1-2]  原为ONE在个人网站上连载的练笔之作， [3]  后被喜爱该作的另一漫画家村田雄介，在征得ONE同意后重新绘制而成。', 'canvas')
      }}>Send</button>
    </div>
  ))
  .add('Test short msg', () => (
    <div>
      <App/>
      <button onClick={()=>{
        sendDanmu('Hello there!', 'canvas')
      }}>Send</button>
    </div>
  ))
  .add('Test long msg', () => (
    <div>
      <App/>
      <button onClick={()=>{
        sendDanmu('One-Punch Man (Japanese: ワンパンマン Hepburn: Wanpanman) is an ongoing Japanese superhero webcomic created by ONE which began publication in early 2009. The series quickly went viral, surpassing 7.9 million hits in June 2012.', 'canvas')
      }}>Send</button>
    </div>
  ));