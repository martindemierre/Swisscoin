import React, {PropTypes, Component} from 'react';
import classnames from 'classnames';
import TextField from 'material-ui/TextField';
const txHelper = require('../../lib/tx-helper')

import {connect} from "react-redux";
import * as actions from "../../../ui/app/actions";
import {Divider} from "material-ui";
const util = require('../util')
const ethUtil = require('ethereumjs-util')

class ConfirmTransaction extends Component {

  static propTypes = {};

  constructor(props, context) {
    super(props);
    this.state = {
      sliderValue: 10
    };
    var _this=this

    if(!this.props.tx.gasPriceSpecified) {
      this.props.dispatch(actions.getGasPrice()).then(function (result) {
        var gasPrice = util.numericBalance(result)
        gasPrice = gasPrice.div(util.bnTable.gwei)
        const defaultGasPrice = gasPrice.toNumber() + 2;
        _this.setState({sliderValue: defaultGasPrice})
        _this.props.setGasPrice(defaultGasPrice)
      })
    }
  }

  handleChange(evt) {
    this.props.setGasPrice(evt.target.value)
    this.setState({
      sliderValue: evt.target.value
    });
  }

  getGasPrice=()=>{
    const tx = this.props.tx;
    return tx.gasPriceSpecified?tx.txParams.gasPrice:this.state.sliderValue
  }
  cancel=()=>{
    this.props.dispatch(actions.goHome())
  }

  getValueToSend=(tx)=>{
    if(!tx){
      return
    }
    else if(tx.txParams && tx.txParams.value!=="0x0"){
      var value=util.numericBalance(tx.txParams.value).toNumber()
      value=value/Math.pow(10,18)
      return <h4 className="confTx-amount">{value}<span>ETH</span></h4>
    }
  }

  getFee = (_gasPrice,_estimateGas,gasPriceSpecifed) => {
    if(_gasPrice && _estimateGas) {
      var gasPrice = util.numericBalance(_gasPrice)
      var estGas = util.numericBalance(_estimateGas)
      var toEth=gasPriceSpecifed?Math.pow(10, 9):Math.pow(10, 18)
      const estGasEth = gasPrice.mul(estGas).toNumber() / toEth;
      return estGasEth
    }
    else {
      return 0
    }
  }
  render() {

    var firstTx=this.props.tx
    this.currentTx=firstTx
    const toLength=firstTx.txParams.to.length
    var to=firstTx.txParams.to.slice(0,8)+"..."+firstTx.txParams.to.slice(toLength-8)

    if(firstTx.txParams.gasPrice) {
      this.props.setGasPrice(util.numericBalance(firstTx.txParams.gasPrice))
    }
    const ethFee=this.getFee(firstTx.txParams.gasPrice,firstTx.estimatedGas,firstTx.gasPriceSpecified)
    const usdFee=(ethFee*this.props.conversionRate).toFixed(2)
    var getCurrencySymbol=()=>{
      return this.props.currencySymbol?this.props.currencySymbol:"$"
    }

    return (
      <div className="confTx-container">
        {this.getValueToSend(firstTx)}
        <div className="receipt-info">
          <div style={{width:"30px"}}>To</div>
          <div>{to}<br/>
          </div>
        </div>
        <div className="tx-speed-container" hidden={firstTx.gasPriceSpecified}>
          <div className="speed-title">Transaction Speed</div>
          <input className="mdl-slider mdl-js-slider" type="range" value={this.state.sliderValue}
                 onChange={event => this.handleChange(event)} min="1" max="50" tabIndex="0"/>
          <div className="transaction-info">
            <div>Slow</div>
            <div>{this.state.sliderValue} Gwei</div>
            <div>Fast</div>
          </div>
        </div>
        <div className="receipt-info receipt-fee-info">
          <div>Gas Fee</div>
          <div>{usdFee} {getCurrencySymbol()}<br/>
            <span>{ethFee} ETH</span>
          </div>
        </div>

      </div>
    );
  }

}

function mapStateToProps(state) {
  return {
    state: state,
    unapprovedTxs: state.metamask.unapprovedTxs,
    unapprovedMsgs: state.metamask.unapprovedMsgs,
    unapprovedPersonalMsgs: state.metamask.unapprovedPersonalMsgs,
    unapprovedTypedMessages: state.metamask.unapprovedTypedMessages,
    blockGasLimit: state.metamask.currentBlockGasLimit,
    currentView: state.appState.currentView,
    conversionRate: state.metamask.conversionRate,
    currencySymbol: state.metamask.currencySymbol,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmTransaction)