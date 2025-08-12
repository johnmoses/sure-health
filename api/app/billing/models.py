from enum import Enum
from app.extensions import db
from sqlalchemy.sql import func

class InvoiceStatus(Enum):
    PENDING = 'pending'
    PAID = 'paid'
    OVERDUE = 'overdue'

class Invoice(db.Model):
    __tablename__ = 'invoice'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), nullable=False, default=InvoiceStatus.PENDING.value)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    due_date = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    payments = db.relationship('Payment', back_populates='invoice', cascade='all, delete-orphan')

    @property
    def paid_amount(self):
        return sum(p.amount for p in self.payments)

class Payment(db.Model):
    __tablename__ = 'payment'
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime(timezone=True), server_default=func.now())
    method = db.Column(db.String(50), nullable=True)
    invoice = db.relationship('Invoice', back_populates='payments')
