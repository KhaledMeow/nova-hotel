import React from "react";
import "../styles/AboutPage.css";

const AboutPage = () => {
  return (
    <div className="about-page">
      <h1></h1>
      <h1></h1>
      <h1></h1>
      <h1>Nova Hotel</h1>
      <h1></h1>
      <h1></h1>

      <section className="about-intro">
        <h2>Our Story</h2>
        <p>
          Nova Hotel was founded with a vision to provide exceptional
          hospitality experiences. Located in the heart of the city, we strive
          to blend luxury with comfort, making every guest's stay unique and
          memorable. Since our opening, we have welcomed travelers from all over
          the world, each bringing their own stories and experiences that enrich
          our community.
        </p>
        <p>
          At Nova Hotel, we believe that a good stay starts with excellent
          service. Our dedicated team works tirelessly to ensure that your needs
          are met, from the moment you check in until your departure.
        </p>
      </section>

      <section className="about-values">
        <h2>Our Values</h2>
        <ul>
          <li>
            <strong>Excellence in Service:</strong> We aim to exceed your
            expectations with our attentive service and personalized care.
          </li>
          <li>
            <strong>Commitment to Quality:</strong> From our facilities to our
            cuisine, we prioritize high standards in everything we offer.
          </li>
          <li>
            <strong>Passion for Hospitality:</strong> Our love for hospitality
            drives us to create memorable experiences for our guests.
          </li>
          <li>
            <strong>Sustainability:</strong> We are committed to reducing our
            environmental impact and promoting sustainable practices.
          </li>
          <li>
            <strong>Community Engagement:</strong> We believe in giving back to
            the community and supporting local initiatives.
          </li>
        </ul>
      </section>

      <section className="about-team">
        <h2>Meet the Team</h2>
        <p>
          Our team is dedicated to ensuring your stay is unforgettable. Led by
          our experienced management team, each member is trained to provide the
          highest level of service. From our front desk staff to our
          housekeeping team, we work together to create a welcoming and friendly
          atmosphere.
        </p>
        <p>Meet some of our key team members:</p>
        <ul>
          <li>
            <strong>Jane Doe, General Manager:</strong> With over 15 years of
            experience in the hospitality industry, Jane leads our team with
            passion and dedication.
          </li>
          <li>
            <strong>John Smith, Head Chef:</strong> A culinary artist, John
            crafts delicious dishes using locally sourced ingredients.
          </li>
          <li>
            <strong>Alice Johnson, Guest Relations:</strong> Alice is here to
            ensure that every guest feels at home during their stay.
          </li>
        </ul>
      </section>

      <section className="about-community">
        <h2>Community Involvement</h2>
        <p>
          We are proud to be involved in various local initiatives that help
          strengthen our community. Nova Hotel actively participates in charity
          events, sponsors local sports teams, and collaborates with nearby
          businesses to promote tourism and economic growth.
        </p>
        <p>
          Our hotel hosts regular events to engage with the community, such as
          food drives, workshops, and cultural celebrations. We believe that
          being a responsible corporate citizen is essential to our mission and
          values.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
