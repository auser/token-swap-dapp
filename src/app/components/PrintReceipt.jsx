import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import shopinLogo from './logo__shopin.png';

const DataRow = ({title, value}) => (
  <tr><td style={{fontSize: 18}}><strong>{title}</strong></td><td style={{fontSize: 16}}>{value}</td></tr>
)

const Receipt = ({transactionHash, fromAddress, toAddress, amount}) => (
  <page
    id="receiptDiv"
    className="face face-front"
    style={{
      backgroundColor: '#fff',
      minHeight: '290mm',
      width: '200mm',
      marginLeft: 'auto',
      marginRight: 'auto',
      padding: 20,
      display: 'block',
      margin: '0 auto',
      marginBottom: '0.5cm',
      boxShadow: '0 0 0.5cm rgba(0,0,0,0.5)'
    }}
  >
    <div className="header">
      <img role="presentation" src={shopinLogo} />
    </div>

    <div className="body">
      <h2>Token Swap Receipt</h2>

      <p>
        This confirms your transfer of {amount} SHOP tokens. Thank you for supporting Shopin!
      </p>

      <p>The transaction ID for your Swap Request is:</p>
      <code>{transactionHash}</code>
      <h2>Transaction details</h2>
      <table style={{
        width: '100%'
      }}>
        <tbody>
          <DataRow title='Participant address' value={fromAddress} />
          <DataRow title='Syndicate address' value={toAddress} />
          <DataRow title='SHOP received' value={amount} />
        </tbody>
      </table>
    </div>
  </page>
);

class PrintReceipt extends React.Component {
  constructor (props) {
    super (props);

    this.state = {
      printing: false,
    };
  }

  generatePDF = async () => {
    const input = document.getElementById ('receiptDiv');
    this.setState({
      printing: true
    }, () => {

      html2canvas (input, {scale: '2'}).then (canvas => {
        const imgData = canvas.toDataURL ('image/png');
        let pdf = new jsPDF ('portrait', 'mm', 'a4');
        pdf.scaleFactor = 2;

        pdf.addImage (imgData, 'JPEG', 0, 0, 210, 297);
        pdf.save ('receipt.pdf');
        this.setState({printing: false})
      });
    })
    };

  render () {
    return (
      <div className="printer">
        <h1>Your receipt</h1>

        {
          this.state.printing &&
          <p>
            Generating your receipt... it will download shortly...
          </p>
        }

        <Receipt {...this.props.transaction} />

        <button
          style={{
            marginTop: 20,
            marginBottom: 20,
          }}
          disabled={this.state.printing}
          className="download-button pure-button"
          onClick={this.generatePDF}
        >
          Save PDF
        </button>

      </div>
    );
  }
}

export default PrintReceipt
