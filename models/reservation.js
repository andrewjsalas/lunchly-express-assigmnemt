/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  // Find reservation by id
  static async get(id){
    const result = await db.query(
      `SELECT id,
        customer_id AS "costumerID",
        num_guests AS "numGuests",
        start_as AS "startAt",
      FROM reservations,
      WHERE id=$1`,
      [id]
    )

    let reservation = result.row[0];

    if (reservation === undefined) {
      const err = new Error(`Unable to find reservation ${id}`);
      err.status = 404;
      throw err;
    }
    return new Reservation(reservation);
  }

  // Save a reservation
  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations
          (customer_id, num_guests, start_at, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [this.numGuests, this.startAt, this.notes, this.id]
      );
    }
  }
}

module.exports = Reservation;
