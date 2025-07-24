from app.extensions import db
from sqlalchemy.sql import func

class Invoice(db.Model):
    __tablename__ = 'invoice'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')  # e.g. pending, paid, overdue
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    due_date = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    payments = db.relationship('Payment', back_populates='invoice', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Invoice {self.id} patient={self.patient_id} status={self.status} amount={self.amount}>"

class Payment(db.Model):
    __tablename__ = 'payment'

    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime(timezone=True), server_default=func.now())
    method = db.Column(db.String(50), nullable=True)  # e.g. credit card, paypal, cash

    invoice = db.relationship('Invoice', back_populates='payments')

    def __repr__(self):
        return f"<Payment {self.id} invoice={self.invoice_id} amount={self.amount}>"
