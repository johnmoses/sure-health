from app.extensions import ma
from app.monitoring.models import VitalSign

class VitalSignSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = VitalSign
        load_instance = True
        include_fk = True
        datetimeformat = '%Y-%m-%dT%H:%M:%S'
