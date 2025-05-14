"""create meal plans table

Revision ID: create_meal_plans_001
Revises: aee011dcff56
Create Date: 2024-03-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'create_meal_plans_001'
down_revision = 'aee011dcff56'
branch_labels = None
depends_on = None

def upgrade():
    # Create meal_plans table
    op.create_table(
        'meal_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('date', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_meal_plans_id'), 'meal_plans', ['id'], unique=False)
    op.create_index(op.f('ix_meal_plans_name'), 'meal_plans', ['name'], unique=False)

    # Create meal_plan_foods association table
    op.create_table(
        'meal_plan_foods',
        sa.Column('meal_plan_id', sa.Integer(), nullable=True),
        sa.Column('food_item_id', sa.Integer(), nullable=True),
        sa.Column('quantity', sa.Float(), nullable=True),
        sa.Column('meal_type', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['food_item_id'], ['food_items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['meal_plan_id'], ['meal_plans.id'], ondelete='CASCADE')
    )

def downgrade():
    op.drop_table('meal_plan_foods')
    op.drop_index(op.f('ix_meal_plans_name'), table_name='meal_plans')
    op.drop_index(op.f('ix_meal_plans_id'), table_name='meal_plans')
    op.drop_table('meal_plans') 