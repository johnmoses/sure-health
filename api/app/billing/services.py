from app.billing.models import Invoice
from app.agents.multi_agents import BillingAgent
from app.extensions import db
from app.billing.models import Payment
from flask import current_app

class BillingService:
    def __init__(self):
        self.agent = BillingAgent()

    def summarize_invoice(self, invoice_id: int) -> str:
        """
        Prepare invoice summary context for billing agent.
        """
        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            return ""

        payments = invoice.payments
        total_paid = sum(p.amount for p in payments)
        payment_details = "\n".join(f"Payment on {p.payment_date.date()}: ${p.amount} via {p.method or 'unknown'}" for p in payments) or "No payments made yet."

        context = (
            f"Invoice ID: {invoice.id}\n"
            f"Patient ID: {invoice.patient_id}\n"
            f"Amount Due: ${invoice.amount}\n"
            f"Status: {invoice.status}\n"
            f"Due Date: {invoice.due_date}\n"
            f"Payments:\n{payment_details}\n"
            f"Total Paid: ${total_paid}\n"
            f"Remaining Balance: ${max(0, invoice.amount - total_paid)}"
        )
        return context

    def answer_billing_query(self, query: str, invoice_id: int = None) -> dict:
        """
        Call BillingAgent with query and optional invoice context
        """
        context = ""
        if invoice_id:
            context = self.summarize_invoice(invoice_id)
        
        try:
            response = self.agent.answer(query, context)
            return {
                "success": True,
                "answer": response
            }
        except Exception as e:
            current_app.logger.error(f"BillingService agent error: {e}", exc_info=True)
            return {
                "success": False,
                "message": "Failed to process billing query."
            }

    def create_payment(self, invoice_id, amount, method=None):
        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            raise ValueError("Invoice not found")

        payment = Payment(invoice_id=invoice_id, amount=amount, method=method)
        db.session.add(payment)

        total_paid = sum(p.amount for p in invoice.payments) + amount
        invoice.status = 'paid' if total_paid >= invoice.amount else 'pending'

        db.session.commit()
        return payment
