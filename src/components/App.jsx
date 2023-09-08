import { Component } from 'react';
import { GlobalStyle } from './GlobalStyle';
import { Layout } from './Layout';
import { Searchbar } from './Searchbar/Searchbar';
import { Button } from './Button/Button';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { fetchImages } from './api';
import { Loader } from './Loader/Loader';
import toast, { Toaster } from 'react-hot-toast';
import { GallerryModal } from './Modal/Modal';

export class App extends Component {
  state = {
    query: '',
    images: [],
    loading: false,
    page: 1,
    error: false,
    perPage: 12,
    isOpen: false,
  };

  handleSubmit = evt => {
    evt.preventDefault();

    if (evt.target.elements.query.value === '') {
      toast.error('You have not entered anything!');
    } else {
      this.setState({
        query: `${Date.now()}/${evt.target.elements.query.value}`,
        images: [],
        page: 1,
      });
    }
  };

  async componentDidUpdate(prevProps, prevState) {
    const { query, perPage, page, images } = this.state;
    if (prevState.query !== query || prevState.page !== page) {
      try {
        this.setState({ loading: true, error: false, isOpen: false });
        const allImages = await fetchImages(query, page, perPage);

        if (allImages.length === 0) {
          return toast.error(
            'Opps, there are no pictures according to your request... '
          );
        }

        this.setState({
          images: [...images, ...allImages],
        });
      } catch (error) {
        this.setState({
          error: true,
        });
      } finally {
        this.setState({ loading: false });
      }
    }
  }

  handleLoadMore = () => {
    this.setState(({ page }) => ({
      page: page + 1,
    }));
  };

  handleOpenModal = (url, alt) => {
    this.setState(({ isOpen }) => ({
      isOpen: !isOpen,
      url,
      alt,
    }));
    console.log(this.state.isOpen);
  };
  handleCloseModal = this.handleCloseModal.bind(this);
  handleCloseModal() {
    this.setState(({ isOpen }) => ({
      isOpen: !isOpen,
    }));
  }

  render() {
    const { images, loading, error, isOpen, url, alt } = this.state;
    const isLoadBtn = !!(images.length > 0 && !loading);

    return (
      <Layout>
        <Searchbar onSubmit={this.handleSubmit} />
        {images.length > 0 && (
          <ImageGallery isOpen={this.handleOpenModal} items={images} />
        )}
        {loading && <Loader />}
        {error && <div>OPPS! THERE WAS AN ERROR!</div>}
        {isLoadBtn && <Button onClick={this.handleLoadMore} />}
        {isOpen && (
          <GallerryModal
            alt={alt}
            url={url}
            isOpen={isOpen}
            isClose={this.handleCloseModal}
          />
        )}
        <GlobalStyle />
        <Toaster position="top-right" />
      </Layout>
    );
  }
}
