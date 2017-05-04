class StopImagesController < ApplicationController
  wrap_parameters :stop_image, include: ["image_id", "stop_id", "priority"]
  before_action :get_stop, only: [:index, :update, :destroy]
  before_action :get_image, only: [:image_stops]
  before_action :get_stop_image, only: [:update, :destroy]
  #before_action :authenticate_user!, only: [:create, :update, :destroy]
  #after_action :verify_authorized, except: [:trips]
  #after_action :verify_policy_scoped, only: [:linkable_stops]
  before_action :origin, only: [:trips]

  def index
    authorize @stop, :get_images?
    @stop_images = @stop.stop_images.prioritized.with_caption
  end

  def image_stops
    #authorize @image, :get_stops?
    @stop_images=@image.stop_images.prioritized.with_name
    render :index
  end

  def linkable_stops
    authorize Stop, :get_linkables?
    image = Image.find(params[:image_id])
    #@stops=policy_scope(Stop.not_linked(image))
    #need to exclude admins from seeing stops they cannot link
    @stops=Stop.not_linked(image)
    @stops=StopPolicy::Scope.new(current_user,@stops).user_roles(true,false)
    @stops=StopPolicy.merge(@stops)
    render "stops/index"
  end

  def trips
    expires_in 1.minute, :public=>true
    miles=params[:miles] ? params[:miles].to_f : nil
    trip=params[:trip]
    distance=params[:distance] ||= "false"
    reverse=params[:order] && params[:order].downcase=="desc"  #default to ASC
    last_modified=StopImage.last_modified
    state="#{request.headers['QUERY_STRING']}:#{last_modified}"
    #use eTag versus last_modified -- ng-token-auth munges if-modified-since
    eTag="#{Digest::MD5.hexdigest(state)}"

    if stale?  :etag=>eTag
      @stop_images=StopImage.within_range(@origin, miles, reverse)
        .with_name
        .with_caption
        .with_position
      @stop_images = @stop_images.with_trip(params[:trip_id]) if params[:trip_id]
      @stop_images=@stop_images.stops    if trip && trip.downcase=="stop"
      @stop_images=StopImage.with_distance(@origin, @stop_images) if distance.downcase=="true"
      render "stop_images/index"
    end
  end

  def create
    stop_image = StopImage.new(stop_image_create_params.merge({
                                  :image_id=>params[:image_id],
                                  :stop_id=>params[:stop_id],
                                  }))
    stop=Stop.where(id:stop_image.stop_id).first
    if !stop
      full_message_error "cannot find stop[#{params[:stop_id]}]", :bad_request
      skip_authorization
    elsif !Image.where(id:stop_image.image_id).exists?
      full_message_error "cannot find image[#{params[:image_id]}]", :bad_request
      skip_authorization
    else
      authorize stop, :add_image?
      stop_image.creator_id=current_user.id
      if stop_image.save
        head :no_content
      else
        render json: {errors:@stop_image.errors.messages}, status: :unprocessable_entity
      end
    end
  end

  def update
    authorize @stop, :update_image?
    if @stop_image.update(stop_image_update_params)
      head :no_content
    else
      render json: {errors:@stop_image.errors.messages}, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @stop, :remove_image?
    @stop_image.image.touch #image will be only stop left
    @stop_image.destroy
    head :no_content
  end

  private
    def get_stop
      @stop ||= Stop.find(params[:stop_id])
    end
    def get_image
      @image ||= Image.find(params[:image_id])
    end
    def get_stop_image
      @stop_image ||= StopImage.find(params[:id])
    end

    def stop_image_create_params
      params.require(:stop_image).tap {|p|
          #_ids only required in payload when not part of URI
          p.require(:image_id)    if !params[:image_id]
          p.require(:stop_id)    if !params[:stop_id]
        }.permit(:priority, :image_id, :stop_id)
    end
    def stop_image_update_params
      params.require(:stop_image).permit(:priority)
    end

    def origin
      case
      when params[:lng] && params[:lat]
        @origin=Point.new(params[:lng].to_f, params[:lat].to_f)
      else
        raise ActionController::ParameterMissing.new(
          "an origin [lng/lat] required")
      end
    end
end
