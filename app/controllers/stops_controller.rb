class StopsController < ApplicationController
  before_action :set_stop, only: [:show, :update, :destroy]
  wrap_parameters :stop, include: ["name", "description", "notes"]


  # GET /stops
  # GET /stops.json
  def index
    @stops = Stop.all

    render json: @stops
  end

  # GET /stops/1
  # GET /stops/1.json
  def show
    render json: @stop
  end

  def create
    authorize Stop
    @stop = Stop.new(stop_params)

    User.transaction do
      if @stop.save
        role=current_user.add_role(Role::ORGANIZER,@stop)
        @stop.user_roles << role.role_name
        role.save!
        render :show, status: :created, location: @stop
      else
        render json: {errors:@stop.errors.messages}, status: :unprocessable_entity
      end
    end
  end

  def update
    authorize @stop

    if @stop.update(stop_params)
      head :no_content
    else
      render json: {errors:@stop.errors.messages}, status: :unprocessable_entity
    end
  end

  private

    def set_stop
      @stop = Stop.find(params[:id])
    end

    def stop_params
      params.require(:stop).tap {|p|
          p.require(:name) #throws ActionController::ParameterMissing
        }.permit(:name, :description, :notes)
    end
end
