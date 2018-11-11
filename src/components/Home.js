import React, {Component} from 'react';
import * as _ from 'underscore';
import './Home.css'
import loader from './img/preloader64.gif';

class Home extends Component {
    constructor(props) {
        super(props);
        this.handleChangeInput = this.handleChangeInput.bind(this);
        this.handleListItemClick = this.handleListItemClick.bind(this);
        this.handleClickInput = this.handleClickInput.bind(this);
        this.state = {
            results: [],
            numFound: '0',
            loading: false,
            showList: false,
            searchTerm: '',
            itemSelected: false
        };
    }
    renderList() {
        return (
            <ul className="searchResults">
            {
                parseInt(this.state.numFound) === 0 && !this.state.loading ? 
                    <li className="noResults">
                        <div>No results found</div>                        
                    </li>
                :
                    this.state.results.map((item, index) => {
                        return this.renderListItem(item, index);
                    })
            }
            </ul>
        );
    }

    locationInfo(placeType) {
        switch(placeType){
            case "A": 
                return {type:"Airport", color:"#f2817f"};
            case "D": 
                return {type: "District", color: "#70d58e"};
            case "C": 
                return {type: "City", color: "#6eb8fa"};
            case "P": 
                return {type: "Place", color: "#ffa981"};
            case "T": 
                return {type: "Station", color: "#9d9dbb"};
            case "R": 
                return {type: "Region", color: "#46d3bb"};
            default:
                return {type: "Place", color: "#ffa981"};
        }
    }

    getHighlightedText(text, higlight) {
        // Split on higlight term and include term into parts, ignore case
        let parts = text.split(new RegExp(`(${higlight})`, 'gi'));
        return <span> { parts.map((part, i) => 
            <span key={i} style={part.toLowerCase() === higlight.toLowerCase() ? { fontWeight: 'bold' } : {} }>
                { part }
            </span>)
        } </span>;
    }

    renderListItem(item, key) {
        var locationBadge = this.locationInfo(item.placeType);

        return (
            // BadgeType | Name 
            //           | Region , Country
            // data-name={item.name} data-region={item.region} data-country={item.country}
            <li key={key} onClick={() => this.handleListItemClick(item.name, item.region, item.country)}>
                <a>
                    <span className="locationBadge" style={{backgroundColor: locationBadge.color}}>{locationBadge.type}</span>
                    <div>
                        {this.getHighlightedText(item.name, this.state.searchTerm)}
                        <span className="locationDescription">{item.region ? `${item.region}, ` : ''}{item.country}</span>
                    </div>
                </a>
            </li>
        );
    }

    handleListItemClick(name, region, country) {
        let input = this.refs.searchInput;
        let itemDescription = (region ? `${region}, ` : '') + country;
        input.value = `${name} ${itemDescription}`;
        this.setState({
            showList: false,
            itemSelected: true
        })
    }

    handleChangeInput(e) {
        let val = e.target.value;
        if (val !== '' && (val).length > 2) {
            this.performSearch(val);
            this.setState({
                showList: true,
                itemSelected: false
            })
        } else {
            this.setState({
                results: [],
                loading: false,
                showList: false,
                searchTerm: val,
                itemSelected: false
            });
        }
    }

    handleClickInput(e) {
        if (this.state.itemSelected && parseInt(this.state.numFound) > 0) {
            e.target.value = this.state.searchTerm;
            this.setState({
                showList: true
            })
        } else if(!this.state.itemSelected && !_.isEmpty(this.state.alwaysData)) {
            e.target.value = this.state.alwaysData[0].searchTerm;
            this.setState({
                showList: true,
                results: this.state.alwaysData[0].results,
                numFound: this.state.alwaysData[0].numFound
            })
        }
    }

    performSearch = (query) => {
        this.setState({
            loading: true,
        });
        fetch(`https://cors.io/?https://www.rentalcars.com/FTSAutocomplete.do?solrIndex=fts_en&solrRows=${6}&solrTerm=${query}`)
          .then(response => response.json())
          .then(responseData => {
            let data = [];
            let alwaysData = []
            if (_.has(responseData.results, 'docs') && !_.isEmpty(responseData.results)) {
                _.each(responseData.results.docs, (item) => {
                    data.push(item);
                });
            }
            if (parseInt(responseData.results.numFound) > 0) {
                alwaysData.push({
                    results: data,
                    numFound: responseData.results.numFound,
                    searchTerm: query
                })
            } else {
                alwaysData = this.state.alwaysData
            }

            this.setState({
                alwaysData: alwaysData,
                results: data,
                numFound: responseData.results.numFound,
                searchTerm: query,
                loading: false
            });
          })
          .catch(error => {
            console.log('Error fetching and parsing data', error);
            this.setState({
                alwaysData: [],
                results: [],
                numFound: '0',
                searchTerm: query,
                loading: false
            });
          });
      }

    render() {
        let { loading, showList } = this.state;
        let loaderVisibility = loading ? {visibility: 'visible'} : {visibility: 'hidden'}
        return (
            <div>
                <div className="slider">

                </div>
                <div className="content">
                    <div className="searchBox">
                        <h2>Where are you going?</h2>
                        <div className="autocomplete">
                            <label>Pick-up Location</label>
                            <div className="inputSearchContainer">
                                <input ref="searchInput" onClick={this.handleClickInput} onChange={this.handleChangeInput} placeholder="city, airport, station, region and district..."/>
                                <span className="loader"><img alt="" src={loader} style={loaderVisibility} /></span>
                            </div>
                        </div>
                        {showList ? this.renderList() : ''}
                        
                    </div>
                    
                </div>
                
            </div>
        );
    }
}

export default Home;
