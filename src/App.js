import React, { Component } from 'react'
import styled, { css } from 'styled-components'
import './App.scss'
import edit from './images/edit.svg'
import save from './images/save.svg'
import flipIcon from './images/flip.svg'
import defaultCards from './mocks/data.json'

const FlipContainer = styled.div`
  width: 230px;
  height: 230px;
  perspective: 1000px;
  margin: 20px;
  display: inline-block;
  &:hover {
    cursor: pointer;
  }
  .flipper {
    transition: 0.6s;
    transform-style: preserve-3d;
    position: relative;
    height: 100%;
    ${({ flipped }) =>
      flipped &&
      css`
        transform: rotateY(180deg);
      `}
    ${({ isAdding }) =>
      isAdding &&
      css`
        transition: 0s;
      `}
  }
`

const Front = styled.div`
  z-index: 2;
  transform: rotateY(0deg);
  backface-visibility: hidden;
  position: absolute;
  top: 0;
  border: 1px solid #ccc;
  border-radius: 2px;
  box-shadow: 0 0.4rem 1.2rem 0.2rem rgba(0, 0, 0, 0.05);
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 3px solid #747a7e;
  width: 230px;
  height: 230px;
`
const Back = styled(Front)`
  background: rgba(250, 250, 250, 1);
  transform: rotateY(180deg);
  border: 1px solid #ccc;
`

const AddCard = styled.button`
  color: #fff;
  background-color: #5cb85c;
  border: 1px solid #4cae4c;
  height: 50px;
  width: 230px;
  position: absolute;
  left: calc(50% - 115px);
  top: 25px;
  outline: none;
  cursor: pointer;
  transition: 0.25s;
  border-radius: 4px;
  &:hover {
    background-color: #47a447;
    border-color: #398439;
    transition: 0.25s;
  }
`

const CardIcon = styled.div`
  background-image: ${({ url }) => (url ? `url('${url}')` : 'none')};
  width: 20px;
  height: 20px;
  position: absolute;
  background-repeat: no-repeat;
  bottom: 10px;
  right: 10px;
  border: none;
  z-index: 100;
  transition: 0.3s;
  background-size: 20px;
  &:hover {
    filter: brightness(50%);
  }
`
const Flip = styled(CardIcon)`
  font-size: 10px;
  color: #707070;
  width: 100px;
  display: flex;
  align-items: center;
  background-position: 100% 100%;
  right: 40px;
  padding-left: 20px;
  font-style: italic;
  &:hover {
    color: black;
  }
`

const CardSavedText = styled.span`
  max-width: 227px;
  word-wrap: break-word;
  overflow: auto;
  max-height: 160px;
  padding: 0px 20px;
`

const CardTextArea = styled.textarea`
  text-align: center;
  outline: none;
  border: transparent;
  height: 224px;
  padding: 103px 20px 0 20px;
  width: 230px;
`

class App extends Component {
  constructor(props) {
    super(props)
    this.textArea = React.createRef()
  }
  state = {
    cards: [],
    isAdding: false,
    isEditing: null,
    sideEditing: null,
    hasFlipped: false
  }

  componentDidMount() {
    this.setState({
      cards: defaultCards
    })
  }

  flipCard = indexToFlip => {
    const { cards, isEditing } = this.state
    if (isEditing) {
      return
    }
    const updatedCard = {
      ...cards[indexToFlip],
      flipped: !cards[indexToFlip].flipped
    }
    const newState = [
      ...cards.slice(0, indexToFlip),
      updatedCard,
      ...cards.slice(indexToFlip + 1)
    ]
    this.setState({
      cards: newState,
      hasFlipped: true
    })
  }

  addCard = () => {
    const { cards } = this.state
    const newCard = {
      front: `card #${cards.length + 1} front`,
      back: `card #${cards.length + 1} back`,
      flipped: false,
      cardId: cards.length
    }

    const newState = [newCard, ...cards.slice(0)]
    this.setState(
      {
        cards: newState,
        isAdding: true,
        isEditing: null
      },
      () => {
        // FIXME - when new elements are added to the DOM, we have to temporarily
        // set transition: 0s, to avoid some weird behavior
        setTimeout(() => {
          this.setState({
            isAdding: false
          })
        }, 10)
      }
    )
  }

  toggleEditCard = (e, idx, side) => {
    e.stopPropagation()
    const { isEditing } = this.state
    if (isEditing === idx) {
      return this.setState({
        isEditing: null,
        sideEditing: null
      })
    }
    this.setState(
      {
        isEditing: idx,
        sideEditing: side
      },
      () => {
        this.textArea.current.focus()
      }
    )
  }

  renderCardContent = (cardText, idx, sideToRender) => {
    const { isEditing, sideEditing } = this.state
    if (isEditing === idx) {
      return (
        <CardTextArea
          onClick={this.preventFlip}
          onChange={e => this.updateCardText(e, idx, sideEditing)}
          value={cardText}
          ref={sideToRender === sideEditing ? this.textArea : null}
        />
      )
    }
    return <CardSavedText>{cardText}</CardSavedText>
  }

  preventFlip = (e, idx) => {
    e.stopPropagation()
  }

  updateCardText = (e, idx) => {
    const { cards, sideEditing } = this.state
    const updatedCard = {
      ...cards[idx],
      [sideEditing]: e.target.value
    }
    const newState = [
      ...cards.slice(0, idx),
      updatedCard,
      ...cards.slice(idx + 1)
    ]
    this.setState({
      cards: newState
    })
  }

  renderBackSide = (card, idx) => {
    const { isEditing } = this.state
    return (
      <Back onClick={() => this.flipCard(idx)}>
        {this.renderCardContent(card.back, idx, 'back')}
        <CardIcon
          onClick={e => this.toggleEditCard(e, idx, 'back')}
          url={isEditing === idx ? save : edit}
        />
        <Flip url={flipIcon} onClick={() => this.flipCard(idx)} />
      </Back>
    )
  }

  renderFrontSide = (card, idx) => {
    const { isEditing, hasFlipped } = this.state
    return (
      <Front onClick={() => this.flipCard(idx)}>
        {this.renderCardContent(card.front, idx, 'front')}
        <CardIcon
          onClick={e => this.toggleEditCard(e, idx, 'front')}
          url={isEditing === idx ? save : edit}
        />
        <Flip url={flipIcon} onClick={() => this.flipCard(idx)}>
          {!hasFlipped ? 'Click to flip' : ''}
        </Flip>
      </Front>
    )
  }

  render() {
    const { cards, isAdding } = this.state

    return (
      <div className='app'>
        <AddCard onClick={this.addCard}>Add Card</AddCard>
        {cards.map((card, idx) => {
          return (
            <FlipContainer flipped={card.flipped} isAdding={isAdding} key={idx}>
              <div className='flipper'>
                {this.renderFrontSide(card, idx)}
                {this.renderBackSide(card, idx)}
              </div>
            </FlipContainer>
          )
        })}
      </div>
    )
  }
}

export default App
