from app.extensions import db
from app.dashboard.models import AppMetric, UserActivity
from app.auth.models import User # Assuming User model from auth blueprint
from datetime import datetime, timedelta
from sqlalchemy import func, extract

def record_metric(metric_name, value, dimension_key=None, dimension_value=None):
    """Records a single application metric."""
    metric = AppMetric(
        metric_name=metric_name,
        value=value,
        dimension_key=dimension_key,
        dimension_value=dimension_value
    )
    db.session.add(metric)
    db.session.commit()

def record_user_activity(user_id, activity_type, details=None):
    """Records user specific activity."""
    activity = UserActivity(
        user_id=user_id,
        activity_type=activity_type,
        details=details
    )
    db.session.add(activity)
    db.session.commit()

def get_total_users():
    """Returns the total number of registered users."""
    return User.query.count()

def get_daily_active_users(days_ago=7):
    """Calculates daily active users for the last N days."""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days_ago)

    active_users = (
        UserActivity.query
        .filter(UserActivity.timestamp >= start_date)
        .filter(UserActivity.timestamp <= end_date)
        .group_by(func.date(UserActivity.timestamp))
        .group_by(UserActivity.user_id) # Ensure unique user per day
        .with_entities(func.date(UserActivity.timestamp).label('date'), func.count(func.distinct(UserActivity.user_id)).label('count'))
        .order_by('date')
        .all()
    )
    return [{"date": str(row.date), "count": row.count} for row in active_users]


def get_api_call_counts_per_endpoint(period_hours=24):
    """Aggregates API call counts per endpoint from logs or custom metrics."""
    # This is a placeholder. In a real system, you'd integrate with:
    # 1. Access logs (Nginx, Gunicorn)
    # 2. Application logging (structured logs)
    # 3. Dedicated APM tools (e.g., Prometheus/Grafana, Datadog)
    
    # For this example, we'll use our AppMetric model if you record 'api_calls'
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=period_hours)

    api_calls = (
        AppMetric.query
        .filter(AppMetric.metric_name == 'api_call')
        .filter(AppMetric.timestamp >= start_time)
        .group_by(AppMetric.dimension_value) # Assuming dimension_value is endpoint path
        .with_entities(AppMetric.dimension_value.label('endpoint'), func.count().label('count'))
        .order_by(func.count().desc())
        .all()
    )
    return [{"endpoint": row.endpoint, "count": row.count} for row in api_calls]


def get_llm_query_counts(period_hours=24):
    """Counts LLM queries."""
    from app.llm.models import LLMQueryLog  # Import from llm blueprint
    from datetime import datetime, timedelta

    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=period_hours)
    
    total_queries = (
        LLMQueryLog.query
        .filter(LLMQueryLog.created_at >= start_time)  # Use created_at instead of timestamp
        .count()
    )
    return total_queries


def get_llm_queries_by_model(period_hours=24):
    """Counts LLM queries by model."""
    from app.llm.models import LLMQueryLog
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=period_hours)

    queries_by_model = (
        LLMQueryLog.query
        .filter(LLMQueryLog.created_at >= start_time)
        .group_by(LLMQueryLog.model_name)
        .with_entities(LLMQueryLog.model_name.label('model'), func.count().label('count'))
        .all()
    )
    return [{"model": row.model, "count": row.count} for row in queries_by_model]

def get_metric_data():
    """
    Aggregates key metrics into a formatted string (or a dict, depending on your usage)
    for dashboard LLM or summary endpoints.
    """

    total_users = get_total_users()
    daily_active = get_daily_active_users(days_ago=7)
    api_calls = get_api_call_counts_per_endpoint(period_hours=24)
    llm_queries = get_llm_query_counts(period_hours=24)
    llm_by_model = get_llm_queries_by_model(period_hours=24)

    # Format daily active users as "date: count" lines
    dau_str = "\n".join(f"{entry['date']}: {entry['count']}" for entry in daily_active)

    # Format API calls as "endpoint: count"
    api_str = "\n".join(f"{entry['endpoint']}: {entry['count']}" for entry in api_calls)

    # Format LLM queries by model
    llm_model_str = "\n".join(f"{entry['model']}: {entry['count']}" for entry in llm_by_model)

    summary = (
        f"Total registered users: {total_users}\n\n"
        f"Daily active users (last 7 days):\n{dau_str}\n\n"
        f"API calls in last 24h:\n{api_str}\n\n"
        f"Total LLM queries last 24h: {llm_queries}\n"
        f"LLM queries by model:\n{llm_model_str}"
    )

    return summary
