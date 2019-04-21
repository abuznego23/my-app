import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { RootCloseWrapper } from 'react-overlays';
import './montserrat.css'; //Close enough to AirBnb's font
import './bootstrap.css'; //Necessary for Bootstrap components to render properly

class PricePerNight extends React.Component {
  // Passed in the price prop as this changes w/ each listing
  render() {
    return (
      <div>
          <span className="price">{'$' + this.props.price}</span>
          <span className='xsf'> per night</span>
      </div>
    );
  }
}

class Rating extends React.Component {
  // Number of stars for this listing would probably come from API,
  // so I passed it in as a prop from main component
  renderStars() {
    let stars = "";
    for(var i = 0; i < this.props.stars; i++) {
      stars += '★';
    }
    return(stars);
  }

  render() {
    // Since the actual result of clicking on the stars/number of ratings is scrolling to
    // the reviews in the page, I simply used a console log as placeholder
    let scrollToReviews = function() { console.log("Pretending to scroll to reviews...") };
    return (
      <div className='xsf'>
          <button id="ratings-btn" onClick={scrollToReviews}>
            <span className="stars">{this.renderStars()}</span>
            <span> {this.props.ratings}</span>
          </button>
      </div>
    );
  }
}

class Dates extends React.Component {
  render() {
    return(
      <div>
        <label>Dates</label>
        <div>
          <DateRangePicker
            startDateId="startDate"
            endDateId="endDate"
            startDatePlaceholderText="Check-in"
            endDatePlaceholderText="Checkout"
            showClearDates={true}
            numberOfMonths={1}
            startDate={this.props.ctx.state.startDate}
            endDate={this.props.ctx.state.endDate}
            onDatesChange={({ startDate, endDate }) => { 
              this.props.ctx.setState({ startDate, endDate })
              // Count # of nights when end date is inputted
              if(endDate != null){
                this.props.ctx.setState({
                  numberNights: endDate.diff(startDate,'days')
                })
              }
            }}
            focusedInput={this.props.ctx.state.focusedInput}
            onFocusChange={(focusedInput) => { this.props.ctx.setState({ focusedInput })}}
          />
        </div>
      </div>
    );
  }
}

class GuestPicker extends React.Component {
  //Child component for Guests 
  //Renders the custom content in the drop down where
  //the user picks guest numbers 
  constructor() {
    super();
    //Need to keep track of these since it affects numbers
    //allowed for the user to input
    this.state = {
      adults: 1,
      children: 0,
      infants: 0
    }
  }

  handleClick() {
    //This directly changes the state of the parent component Guests
    //Pulled this out as its own function for readibility (since there's a lot of arguments)
    this.props.updateGuestCount(this.state.adults + this.state.children, this.state.infants);
  }

  render() {
    let { adults, children, infants } = this.state; // To display the right # between buttons
    let totalGuests = adults + children;
    return(
      //Needed to use this wrapper to fix an issue with the 
      //overlay closing when a button was clicked within the
      //custom content in the dropdown since it was not recognizing
      //it as being inside the dropdown menu
      <RootCloseWrapper
        onRootClose={this.handleRootClose}
        event={this.props.rootCloseEvent}
      >
        <div>
          { /* Basically leveraged CSS props for table/table-cell to have these
             * elements side by side and then just vertically aligned them in the middle
             * 
             * Updating the state upon every click to ensure the limits are enforced (i.e. guest limit)
             */
          }
          <div className="line">
            <div>Adults</div>
            <div className="cell">
              <button
                className="picker-btn minus" 
                disabled={adults <= 1} // Must have at least one adult to book
                onClick={() => {
                  this.setState({ adults: adults - 1 }, this.handleClick);
                }}>
                -
              </button>
              { adults }
              <button
                className="picker-btn plus" 
                disabled={totalGuests === this.props.guestLimit} 
                onClick={() => {
                  this.setState({ adults: adults + 1 }, this.handleClick);
                }}>
                +
              </button>
            </div>
          </div>
          <div className="line">
            <div className="main">Children</div>
            <div className="bottom">Ages 2-12</div>
            <div className="cell">
              <button
                className="picker-btn minus" 
                disabled={children === 0}
                onClick={() => {
                  this.setState({ children: children - 1 }, this.handleClick);
                }}>
                -
              </button>
              { children }
              <button
                className="picker-btn plus" 
                disabled={totalGuests === this.props.guestLimit}
                onClick={() => {
                  this.setState({ children: children + 1 }, this.handleClick);
                }}>
                +
              </button>
            </div>
          </div>
          <div className="line">
            <div className="main">Infants</div>
            <div className="bottom">Under 2</div>
            <div className="cell">
              <button
                className="picker-btn minus" 
                disabled={infants === 0}
                onClick={() => {
                  this.setState({ infants: infants - 1 }, this.handleClick);
                }}>
                -
              </button>
              { infants }
              <button
                className="picker-btn plus" 
                disabled={infants === 5}
                onClick={() => {
                  this.setState({ infants: infants + 1 }, this.handleClick);
                }}>
                +
              </button>
            </div>
          </div>
          <div>
            <p className="sf">{this.props.guestLimit} guests maximum. Infants don't count toward the number of guests.</p>
          </div>
        </div>
      </RootCloseWrapper>
    );
  }
}

class Guests extends React.Component {
  //Parent component for Guests
  //Uses child component GuestPicker for the 
  constructor() {
    super();
    this.state = {
      numberGuests: 1,
      numberInfants: 0 //Track to display correct text in button + pass to main component
    }
    this.updateGuestCount = this.updateGuestCount.bind(this);
  }

  updateGuestCount(guests, infants) {
    this.setState({ numberGuests: guests, numberInfants: infants });
    //Pass numberInfants to main component since having infants
    // requires further approval from host
    this.props.ctx.setState({ numberInfants: infants }); 
  }

  render() {
    let { numberGuests, numberInfants } = this.state;
    // Use counts to display singular/plural properly 
    let guestsText = numberGuests > 1 ? " guests" : " guest";
    let infantsText = numberInfants > 0 ? ", " + numberInfants + " infants" : "";

    return(
      <div className="guest-picker">
        <label>Guests</label>
        <Dropdown>
          <Dropdown.Toggle id="guest-button">{numberGuests + guestsText + infantsText}</Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu">
            <Dropdown.Item 
              as={GuestPicker} //Allows for a custom component in the dropdown menu item
              rootCloseEvent={this.rootCloseEvent} //Fix for custom component to prevent closing of overlay
              updateGuestCount={this.updateGuestCount}
              guestLimit={this.props.limit} >
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
}

class PriceSummary extends React.Component {
  //Component that shows breakdown of prices when the user has selected
  //an end date in the Dates component
  render() {
    let { pricePerNight, numberNights, showPriceSummary } = this.props.ctx.state;
    let totalPerNight = pricePerNight*numberNights;
    let shown = showPriceSummary ? 'visible' : 'hidden';
    return(
      //Also leveraged table/table-cell CSS props to display side by side 
      <div className={"price-summary " + shown}>
        <div className="line ps">
          <div>{'$' + pricePerNight + ' x ' + numberNights + (numberNights > 1 ? " nights" : " night")}</div>
          <div className="cell">{'$' + totalPerNight}</div>
        </div>
        <div className="line ps">
          <div>
            <span>Cleaning fee </span>
            <OverlayTrigger
              className="info-tooltip"
              placement="right"
              delay={{show: 250, hide: 400}}
              overlay={<Tooltip >One-time fee charged by host to cover the cost of cleaning their space.</Tooltip>}
            >
              <button className="tt">?</button>
            </OverlayTrigger>
          </div>
          <div className="cell">$75</div>
        </div>
        <div className="line ps">
          <div>
            <span>Service fee </span>
            <OverlayTrigger
              className="info-tooltip"
              placement="right"
              delay={{show: 250, hide: 400}}
              overlay={<Tooltip >This helps us run our platform and offer services like 24/7 support on your trip.</Tooltip>}
            >
              <button className="tt">?</button>
            </OverlayTrigger>
          </div>
          <div className="cell">$164</div>
        </div>
        <div className="line ps">
          <div>
            <span>Occupancy taxes and fees </span>
            <OverlayTrigger
              className="info-tooltip"
              placement="right"
              delay={{show: 250, hide: 400}}
              overlay={<Tooltip >
                <div>General Sales and Use Tax (Douglas)</div>
                <div>General Sales and Use Tax (Washington)</div>
                <div>Local Sales and Use Tax (Greater Wenatchee Regional Events Center Public Fac District)</div></Tooltip>}
            >
              <button className="tt">?</button>
            </OverlayTrigger>
          </div>
          <div className="cell">$112</div>
        </div>
        <div className="line total-price">
          <div>Total</div>
          <div className="cell">{'$'+ (totalPerNight+75+164+112)}</div>
        </div>
      </div>
    );
  }
}

class ListingInfo extends React.Component {
  //Bottom info about the listing seems to change when the user is ready to book vs. when they have not yet picked a date
  //Designed this accordingly, leveraging showPriceSummary since it already accounts for this
  renderInfo() {
    switch(this.props.showPriceSummary) {
      case true:
        return(
          <div className="bottom-info line">
            <div>
            <div className="main">People are eyeing this place.</div>
            <div>77 others are looking at it for these dates.</div>
            </div>
            <div className="cell"><img alt="" src="https://a0.muscache.com/airbnb/static/page3/icon-uc-eye-3245ad44051a73ed87bf155856f196fc.gif"></img></div>
          </div>
        );
      case false:
        return(
          <div className="bottom-info line">
            <div>
            <div className="main">This home is on people’s minds.</div>
            <div>It’s been viewed 500+ times in the past week.</div>
            </div>
            <div className="cell"><img alt="" src="https://a0.muscache.com/airbnb/static/page3/icon-uc-light-bulb-b34f4ddc543809b3144949c9e8cfcc8d.gif"></img></div>
          </div>
        );
      default:
        return;
    }
  }
  render(){
    return(this.renderInfo());
  }
}

class Booking extends React.Component {
  constructor() {
    super();
    //This info would probably come from API, putting it here for ease of access
    //but could be done differently in real case
    this.state = {
      pricePerNight: 400,
      numberOfStars: 5,
      numberOfRatings: 463,
      availableDates: null,
      guestLimit: 2,
      startDate: null,
      endDate: null,
      showPriceSummary: false,
      numberNights: null,
      numberInfants: null,
      focusedInput: null
    }
    this.submitBooking = this.submitBooking.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    //If the user has updated the Dates and has a valid endDate, then show the PriceSummary component
    let endDateSet = nextState.endDate != null;
    if(nextState.showPriceSummary !== endDateSet){
      this.setState({ showPriceSummary: endDateSet })
    }
  }

  submitBooking() {
    if(this.state.startDate && this.state.endDate){
      //Submit form and take to confirmation page only when we have valid dates!
      console.log("Submitting booking!")
      document.getElementById("booking-btn").disabled = true;
    } else {
      this.setState({ focusedInput: (this.state.startDate ? "endDate" : "startDate")});
    }
  }

  render() {
    //Having infants requires extra approval from host
    let bookingButtonText = this.state.numberInfants > 0 ? "Request to Book" : "Book";
    return (
      <div>
        <div className="top-info">
          <PricePerNight price={this.state.pricePerNight} />
          <Rating 
            ratings={this.state.numberOfRatings}
            stars={this.state.numberOfStars}
          />
        </div>
        <Dates ctx={this} dates={this.state.availableDates} />
        <Guests ctx={this} limit={this.state.guestLimit} />
        <PriceSummary ctx={this} />
        <div className="submit-section">
          <button type="submit" id="booking-btn" onClick={this.submitBooking}>{bookingButtonText}</button>
          <div className="xsf">You won't be charged yet</div>
        </div>
        <ListingInfo showPriceSummary={this.state.showPriceSummary}/>
      </div>
    );
  }
}

class AirBnb extends React.Component {
  render() {
    return (
      <div className="booking">
        <Booking />
      </div>
    );
  }
}

//--------------------------------------

ReactDOM.render(
  <AirBnb />,
  document.getElementById('root')
);

