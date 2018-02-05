import React, { Component } from 'react';
import './Etusivu.css';

class Etusivu extends Component {
  render() {
    return (
      <div className="Etusivu">
        <h2>Opiskelijan nimi</h2>
        <table align="center" className="Taulukko">
          <td>
            <th><h3>Kurssisi</h3></th>
            <tr><Kurssi nimi="Kurssi 1" /></tr>
            <tr><Kurssi nimi="Kurssi 2" /></tr>
            <tr><Kurssi nimi="Kurssi 3" /></tr>
          </td>
        </table>

        <button 
        onClick={this.props.logout}>
        Kirjaudu ulos
        </button>
      </div>
    );
  }
}

const Kurssi = ({ nimi }) => {
  return (
    <div>
      <p>{nimi}</p>
    </div>
  )
}



export default Etusivu;